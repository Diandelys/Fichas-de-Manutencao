// ======== ENGINE DE SINCRONIZAÇÃO SINGLE-FLIGHT & IDEMPOTÊNCIA ========
import { VPS_ENDPOINTS, SUPABASE_CONFIG, STATUS_PDF, SYNC_CONFIG } from "./config.js";
import { initStorage, getPendingVpsForms, getPendingPdfForms, markAsSyncedWithServer } from "./storage.js";
import { gerarFichaPDF, gerarRelatorioPDF } from "./pdf.js";

let isSyncingActive = false;

/**
 * Converte Blob para Base64 Data URL
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Utilitário de Fetch com Timeout configurável
 */
function fetchWithTimeout(url, options, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Timeout de rede após ${timeoutMs / 1000}s`));
    }, timeoutMs);

    fetch(url, { ...options, signal: controller.signal })
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Ponto de entrada unificado para execução de sincronização com Web Locks API
 */
export async function runSingleFlightSync(isManual = false) {
  if (!navigator.onLine) {
    if (isManual) throw new Error("Sem conexão de rede disponível");
    return;
  }

  const isBlocked = localStorage.getItem(SYNC_CONFIG.STORAGE_KEY_AUTO_SYNC) === "true";
  if (!isManual && isBlocked) {
    console.log("[SyncEngine] Sincronização automática pausada (bloqueada pelo usuário).");
    return;
  }

  if (isSyncingActive) {
    console.log("[SyncEngine] Sincronização já em andamento localmente.");
    return;
  }

  if (navigator.locks) {
    return navigator.locks.request("app-sync-lock", { ifAvailable: true }, async (lock) => {
      if (!lock) {
        console.log("[SyncEngine] Lock ocupado por outra aba/processo.");
        return;
      }
      await executeSyncPipeline(isManual);
    });
  }

  // Fallback sem Web Locks
  await executeSyncPipeline(isManual);
}

/**
 * Executa o pipeline de sincronização (VPS + Edge Function)
 */
async function executeSyncPipeline(isManual) {
  isSyncingActive = true;
  try {
    console.log("[SyncEngine] 🚀 Iniciando ciclo de sincronização...");
    
    // Etapa 1: Enviar formulários pendentes para a VPS
    const pendingVps = await getPendingVpsForms();
    if (pendingVps.length > 0) {
      console.log(`[SyncEngine] Enviando ${pendingVps.length} formulário(s) para a VPS...`);
      for (const form of pendingVps) {
        await syncSingleFormToVps(form);
      }
    }

    // Etapa 2: Processar PDFs e disparar Edge Function para WhatsApp
    const pendingPdf = await getPendingPdfForms();
    if (pendingPdf.length > 0) {
      console.log(`[SyncEngine] Processando ${pendingPdf.length} PDF(s) pendente(s)...`);
      for (const form of pendingPdf) {
        await processSingleFormPdfAndEdge(form);
      }
    }

  } catch (error) {
    console.error("[SyncEngine] ❌ Erro durante o pipeline de sync:", error);
    if (isManual) throw error;
  } finally {
    isSyncingActive = false;
  }
}

/**
 * Envia um formulário individual para a VPS com idempotência via `chaveUnica`
 */
async function syncSingleFormToVps(form) {
  try {
    const payload = {
      json_dados: {
        id: form.id,
        cliente: form.cliente,
        cidade: form.cidade,
        equipamento: form.equipamento,
        tecnico: form.tecnico,
        servico: form.servico,
        dataInicial: form.dataInicial,
        horaInicial: form.horaInicial,
        dataFinal: form.dataFinal,
        horaFinal: form.horaFinal,
        veiculo: form.veiculo,
        estoque: form.estoque,
        numeroSerie: form.numeroSerie,
        relatorioMaquina: form.relatorioMaquina,
        materiais: form.materiais,
        chaveUnica: form.chaveUnica,
      },
      chave: form.chaveUnica,
    };

    const response = await fetchWithTimeout(VPS_ENDPOINTS.SET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, 45000);

    if (!response.ok) {
      throw new Error(`Servidor VPS retornou HTTP ${response.status}`);
    }

    const data = await response.json();
    const serverId = data.insertId || data.id || data.existingId || null;

    if (!serverId) {
      throw new Error("VPS não retornou um serverId válido");
    }

    console.log(`[SyncEngine] ✅ Form ${form.id} registrado na VPS com serverId: ${serverId}`);
    await markAsSyncedWithServer(form.id, serverId);

  } catch (err) {
    console.error(`[SyncEngine] ❌ Falha no envio à VPS do form ${form.id}:`, err);
  }
}

/**
 * Processa a geração de PDFs e o disparo para a Edge Function do Supabase
 */
async function processSingleFormPdfAndEdge(form) {
  const db = await initStorage();

  // Transação atômica para marcar status "processando"
  const tx = db.transaction("formularios", "readwrite");
  const store = tx.objectStore("formularios");
  const currentForm = await store.get(form.id);

  if (!currentForm || currentForm.statusPDF === STATUS_PDF.PROCESSANDO) {
    tx.abort();
    return;
  }

  currentForm.statusPDF = STATUS_PDF.PROCESSANDO;
  currentForm.tentativaProcessamento = (currentForm.tentativaProcessamento || 0) + 1;
  currentForm.ultimaTentativa = new Date().toISOString();
  await store.put(currentForm);
  await tx.done;

  try {
    const serverId = currentForm.serverId;
    const payload = { serverId };

    const detalhes = [
      `Cliente: ${currentForm.cliente || "-"}`,
      `Cidade: ${currentForm.cidade || "-"}`,
      `Equipamento: ${currentForm.equipamento || "-"}`,
      `Serviço: ${currentForm.servico || "-"}`,
      `Técnico: ${currentForm.tecnico || "-"}`,
      `Estoque: ${currentForm.estoque || "-"}`,
    ].join("\n");

    if (!currentForm.fichaWhatsapp) {
      console.log(`[SyncEngine] Gerando PDF da Ficha para serverId ${serverId}...`);
      const fichaBlob = await gerarFichaPDF(currentForm, serverId);
      payload.pdfFichaBase64 = await blobToBase64(fichaBlob);
      payload.mensagemFicha = `Ficha de Materiais (Nº ${serverId})\n\n${detalhes}`;
    }

    if (!currentForm.relatorioWhatsapp) {
      console.log(`[SyncEngine] Gerando PDF do Relatório para serverId ${serverId}...`);
      const relatorioBlob = await gerarRelatorioPDF(currentForm, serverId);
      payload.pdfRelatorioBase64 = await blobToBase64(relatorioBlob);
      payload.mensagemRelatorio = `Relatório de Serviço (Nº ${serverId})\n\n${detalhes}`;
    }

    console.log(`[SyncEngine] Disparando Edge Function para serverId ${serverId}...`);
    const response = await fetchWithTimeout(SUPABASE_CONFIG.EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    }, 90000);

    const resultado = await response.json();
    console.log(`[SyncEngine] Resultado Edge Function (HTTP ${response.status}):`, resultado);

    // Atualização de resultado
    const txFinal = db.transaction("formularios", "readwrite");
    const storeFinal = txFinal.objectStore("formularios");
    const formFinal = await storeFinal.get(form.id);

    if (formFinal) {
      if (resultado.fichaWhatsapp) formFinal.fichaWhatsapp = true;
      if (resultado.relatorioWhatsapp) formFinal.relatorioWhatsapp = true;

      const tudoOk = formFinal.fichaWhatsapp && formFinal.relatorioWhatsapp;
      formFinal.statusPDF = tudoOk ? STATUS_PDF.ENVIADO : STATUS_PDF.PENDENTE_PDF;
      formFinal.pdfsEnviados = tudoOk;
      
      if (tudoOk) {
        formFinal.pdfsEnviadosAt = new Date().toISOString();
        console.log(`[SyncEngine] 🎉 Serviço #${serverId} totalmente concluído e enviado no WhatsApp!`);
      } else {
        console.warn(`[SyncEngine] ⚠️ Serviço #${serverId} enviado parcialmente. Retentará.`);
      }

      await storeFinal.put(formFinal);
    }
    await txFinal.done;

  } catch (err) {
    console.error(`[SyncEngine] ❌ Erro ao enviar PDFs do form ${form.id}:`, err);
    
    // Marca erro / rollback status
    const txErr = db.transaction("formularios", "readwrite");
    const storeErr = txErr.objectStore("formularios");
    const formErr = await storeErr.get(form.id);

    if (formErr) {
      const tentativas = formErr.tentativaProcessamento || 0;
      const erroDefinitivo = tentativas >= SYNC_CONFIG.MAX_TENTATIVAS;
      
      formErr.statusPDF = erroDefinitivo ? STATUS_PDF.ERRO_DEFINITIVO : STATUS_PDF.PENDENTE_PDF;
      formErr.erroProcessamento = err.message;
      await storeErr.put(formErr);
    }
    await txErr.done;
  }
}
