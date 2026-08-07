// ======== GERENCIADOR DE BANCO DE DADOS LOCAL (INDEXEDDB REPOSITORY) ========
import { DB_CONFIG, STATUS_PDF, SYNC_CONFIG } from "./config.js";

let dbInstance = null;

/**
 * Auxiliar para gerar chave única determinística/idempotente
 */
export function generateUniqueKey() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `form_${timestamp}_${randomStr}`;
}

/**
 * Inicializa ou realiza upgrade do IndexedDB (v5)
 */
export async function initStorage() {
  if (dbInstance) return dbInstance;

  if (!window.idb) {
    throw new Error("Biblioteca idb (IndexedDB wrapper) não carregada");
  }

  dbInstance = await window.idb.openDB(DB_CONFIG.NAME, DB_CONFIG.VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`[Storage] Migrando banco de v${oldVersion} para v${newVersion}`);

      // Store principal: formularios
      if (!db.objectStoreNames.contains(DB_CONFIG.STORES.FORMULARIOS)) {
        const store = db.createObjectStore(DB_CONFIG.STORES.FORMULARIOS, {
          keyPath: "id",
        });
        store.createIndex("cliente", "cliente", { unique: false });
        store.createIndex("servico", "servico", { unique: false });
        store.createIndex("sincronizado", "sincronizado", { unique: false });
        store.createIndex("statusPDF", "statusPDF", { unique: false });
        store.createIndex("chaveUnica", "chaveUnica", { unique: true });
      } else {
        const store = transaction.objectStore(DB_CONFIG.STORES.FORMULARIOS);
        if (!store.indexNames.contains("statusPDF")) {
          store.createIndex("statusPDF", "statusPDF", { unique: false });
        }
        if (!store.indexNames.contains("chaveUnica")) {
          store.createIndex("chaveUnica", "chaveUnica", { unique: false });
        }
      }

      // Store separada para Blobs pesados (Fotos/Assinaturas)
      if (!db.objectStoreNames.contains(DB_CONFIG.STORES.BLOBS)) {
        db.createObjectStore(DB_CONFIG.STORES.BLOBS, { keyPath: "id" });
      }
    },
  });

  return dbInstance;
}

/**
 * Salva formulário com idempotência e garantia de chave única
 */
export async function saveFormulario(formDataRaw, idEdicao = null) {
  const db = await initStorage();

  const id = idEdicao ? Number(idEdicao) : Date.now();
  const registroExistente = idEdicao ? await db.get(DB_CONFIG.STORES.FORMULARIOS, id) : null;

  const createdAt = registroExistente?.createdAt || new Date().toISOString();
  const chaveUnica = registroExistente?.chaveUnica || generateUniqueKey();

  const registro = {
    ...formDataRaw,
    id,
    createdAt,
    updatedAt: new Date().toISOString(),
    chaveUnica,
    sincronizado: registroExistente ? registroExistente.sincronizado : false,
    syncedAt: registroExistente?.syncedAt || null,
    serverId: registroExistente?.serverId || null,

    // Se é re-salvamento de formulário já sincronizado, exige re-geração de PDF
    statusPDF: registroExistente?.serverId
      ? STATUS_PDF.PENDENTE_PDF
      : registroExistente?.statusPDF || STATUS_PDF.PENDENTE_VPS,

    fichaWhatsapp: registroExistente?.serverId ? false : registroExistente?.fichaWhatsapp || false,
    relatorioWhatsapp: registroExistente?.serverId ? false : registroExistente?.relatorioWhatsapp || false,
    pdfsEnviados: registroExistente?.serverId ? false : registroExistente?.pdfsEnviados || false,
  };

  await db.put(DB_CONFIG.STORES.FORMULARIOS, registro);
  return registro;
}

/**
 * Obtém um formulário pelo ID
 */
export async function getFormulario(id) {
  const db = await initStorage();
  return db.get(DB_CONFIG.STORES.FORMULARIOS, Number(id));
}

/**
 * Lista todos os formulários locais
 */
export async function getAllFormularios() {
  const db = await initStorage();
  const list = await db.getAll(DB_CONFIG.STORES.FORMULARIOS);
  return list
    .filter((f) => !f.serverId || Number(f.serverId) > 700)
    .sort((a, b) => b.id - a.id);
}

/**
 * Remove um formulário do banco
 */
export async function deleteFormulario(id) {
  const db = await initStorage();
  await db.delete(DB_CONFIG.STORES.FORMULARIOS, Number(id));
}

/**
 * Expurga do IndexedDB local todos os registros antigos de teste com serverId <= 700
 */
export async function purgeLocalTestRecords() {
  const db = await initStorage();
  const tx = db.transaction(DB_CONFIG.STORES.FORMULARIOS, "readwrite");
  const store = tx.objectStore(DB_CONFIG.STORES.FORMULARIOS);

  let cursor = await store.openCursor();
  let deletados = 0;
  while (cursor) {
    const val = cursor.value;
    if (val.serverId && Number(val.serverId) <= 700) {
      cursor.delete();
      deletados++;
    }
    cursor = await cursor.continue();
  }
  await tx.done;
  if (deletados > 0) {
    console.log(`[Storage] 🧹 ${deletados} registro(s) antigo(s) de teste (<= 700) expurgados do IndexedDB local.`);
  }
}

/**
 * Retorna formulários pendentes de envio para a VPS
 */
export async function getPendingVpsForms() {
  const db = await initStorage();
  const allForms = await db.getAll(DB_CONFIG.STORES.FORMULARIOS);
  const cutoffTime = Date.now() - SYNC_CONFIG.MAX_RETENTION;

  return allForms.filter(
    (f) => !f.sincronizado && f.id > cutoffTime
  );
}

/**
 * Retorna formulários pendentes de processamento de PDF / WhatsApp
 */
export async function getPendingPdfForms() {
  const db = await initStorage();
  const allForms = await db.getAll(DB_CONFIG.STORES.FORMULARIOS);

  return allForms.filter(
    (f) =>
      f.sincronizado &&
      f.serverId &&
      (f.statusPDF === STATUS_PDF.PENDENTE_PDF ||
        (!f.statusPDF && (!f.fichaWhatsapp || !f.relatorioWhatsapp))) &&
      (f.tentativaProcessamento || 0) < SYNC_CONFIG.MAX_TENTATIVAS
  );
}

/**
 * Atualiza o status de um formulário após confirmação da VPS
 */
export async function markAsSyncedWithServer(idLocal, serverId) {
  const db = await initStorage();
  const tx = db.transaction(DB_CONFIG.STORES.FORMULARIOS, "readwrite");
  const store = tx.objectStore(DB_CONFIG.STORES.FORMULARIOS);
  const form = await store.get(Number(idLocal));

  if (form) {
    form.sincronizado = true;
    form.syncedAt = new Date().toISOString();
    form.serverId = serverId;
    if (form.statusPDF !== STATUS_PDF.ENVIADO) {
      form.statusPDF = STATUS_PDF.PENDENTE_PDF;
    }
    await store.put(form);
  }
  await tx.done;
}

/**
 * Limpa registros antigos com mais de 5 semanas
 */
export async function cleanOldRecords() {
  const db = await initStorage();
  const cutoff = Date.now() - SYNC_CONFIG.MAX_RETENTION;
  const tx = db.transaction(DB_CONFIG.STORES.FORMULARIOS, "readwrite");
  const store = tx.objectStore(DB_CONFIG.STORES.FORMULARIOS);

  let cursor = await store.openCursor();
  while (cursor) {
    if (cursor.key < cutoff) {
      cursor.delete();
    }
    cursor = await cursor.continue();
  }
  await tx.done;
}
