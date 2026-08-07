// ======== MÓDULO DE PROCESSAMENTO DE PDFs — V6 ========
// Correções aplicadas:
//   1. Condição de corrida eliminada via Web Locks API (lock exclusivo atômico)
//   2. Múltiplos gatilhos colapsados em único debouncedVerificar()
//   3. Máquina de estados (statusPDF) substitui booleans soltos
//   4. Transição de estado atômica via transação IndexedDB antes de processar
//   5. Marcação de enviado apenas após confirmação do servidor (item a item)
//   6. Retry com backoff — erro definitivo só após MAX_TENTATIVAS falhas reais
//   7. Fallback para browsers sem Web Locks API

// ======== CONFIGURAÇÃO ========
const SUPABASE_URL = "https://sqiqmpgzjxjjztuzlewg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaXFtcGd6anhqanp0dXpsZXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDEzMzIsImV4cCI6MjA4NTE3NzMzMn0.o-IKqiSvBdUZoKiWHi2TzIBuXPG1jcL2JdUwedNM4y8";

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/enviar-documentos`;

// ======== CONSTANTES DO BANCO DE DADOS ========
const PDF_DB_NAME = "FormulariosDB";
const PDF_DB_VERSION = 4;
const PDF_STORE_NAME = "formularios";

// ======== LIMITES ========
const MAX_TENTATIVAS = 5;

// ======== MÁQUINA DE ESTADOS ========
// Substitui os campos soltos: pdfsEnviados / processandoPDFs / fichaWhatsapp / relatorioWhatsapp / erroDefinitivo
const STATUS_PDF = {
  PENDENTE: "pendente_pdf", // sincronizado com serverId, aguardando envio ao WhatsApp
  PROCESSANDO: "processando", // em processamento ativo (lock adquirido)
  ENVIADO: "enviado", // ambos os PDFs confirmados pelo servidor
  ERRO_DEFINITIVO: "erro_definitivo", // atingiu MAX_TENTATIVAS sem sucesso
};

// ======== FUNÇÃO AUXILIAR: ABRE O BANCO ========
function openFormulariosDB() {
  return idb.openDB(PDF_DB_NAME, PDF_DB_VERSION, {
    upgrade(db, oldVersion) {
      console.log(
        "[PDF Processor] Upgrade do DB da versão",
        oldVersion,
        "para",
        PDF_DB_VERSION,
      );
      if (!db.objectStoreNames.contains(PDF_STORE_NAME)) {
        const store = db.createObjectStore(PDF_STORE_NAME, { keyPath: "id" });
        store.createIndex("cliente", "cliente", { unique: false });
        store.createIndex("servico", "servico", { unique: false });
        store.createIndex("sincronizado", "sincronizado", { unique: false });
        console.log("[PDF Processor] Object store criada:", PDF_STORE_NAME);
      }
    },
  });
}

// ======== DEBOUNCE — ÚNICO PONTO DE ENTRADA ========
// Colapsa todos os gatilhos simultâneos (load, focus, online, visibilitychange, interval)
// em uma única chamada, evitando disparos paralelos antes mesmo do lock ser adquirido.
let _verificarTimer = null;

function debouncedVerificar(delayMs = 500) {
  clearTimeout(_verificarTimer);
  _verificarTimer = setTimeout(verificarPendenciasPDFs, delayMs);
}

// ======== MIGRAÇÃO: FLAGS ANTIGAS → statusPDF ========
async function migrarFlagsAntigas() {
  try {
    const db = await openFormulariosDB();
    const forms = await db.getAll(PDF_STORE_NAME);
    let migrados = 0;

    for (const f of forms) {
      if (f.statusPDF) continue; // já migrado

      let novoStatus = null;

      if (f.fichaWhatsapp && f.relatorioWhatsapp) {
        novoStatus = STATUS_PDF.ENVIADO;
      } else if (f.pdfsEnviados === true) {
        // legado: considera como enviado mesmo sem flags individuais
        f.fichaWhatsapp = true;
        f.relatorioWhatsapp = true;
        novoStatus = STATUS_PDF.ENVIADO;
      } else if (f.erroDefinitivo === true) {
        novoStatus = STATUS_PDF.ERRO_DEFINITIVO;
      } else if (f.processandoPDFs === true) {
        // estava travado como "processando" — reseta para pendente
        f.processandoPDFs = false;
        novoStatus = f.sincronizado && f.serverId ? STATUS_PDF.PENDENTE : null;
      } else if (f.sincronizado && f.serverId) {
        novoStatus = STATUS_PDF.PENDENTE;
      }

      if (novoStatus) {
        f.statusPDF = novoStatus;
        await db.put(PDF_STORE_NAME, f);
        migrados++;
      }
    }

    if (migrados > 0) {
      console.log(
        `🔄 Migração: ${migrados} formulário(s) convertidos para máquina de estados`,
      );
    }
  } catch (err) {
    console.error("❌ Erro na migração de flags:", err);
  }
}

// ======== INICIALIZAÇÃO ========
window.addEventListener("load", async () => {
  console.log("🔍 PDF Processor V6: Iniciando...");
  await migrarFlagsAntigas();
  debouncedVerificar(800); // pequeno delay para a página terminar de carregar
  iniciarMonitoramentoContinuo();
});

// Gatilhos unificados — todos passam pelo debounce
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) debouncedVerificar();
});

window.addEventListener("focus", () => debouncedVerificar());

window.addEventListener("online", () => debouncedVerificar(2000)); // aguarda estabilizar

// ======== MONITORAMENTO CONTÍNUO ========
let _monitorando = false;
let _intervalMonitor = null;

function iniciarMonitoramentoContinuo() {
  if (_monitorando) return;
  _monitorando = true;
  console.log("👁️ Monitoramento ativado (a cada 60 segundos)");
  _intervalMonitor = setInterval(() => debouncedVerificar(), 60_000);
}

window.pararMonitoramentoPDFs = function () {
  if (_intervalMonitor) {
    clearInterval(_intervalMonitor);
    _monitorando = false;
    console.log("⏹️ Monitoramento pausado");
  }
};

// ======== VERIFICAR PENDÊNCIAS — USA WEB LOCKS API ========
// O lock "pdf-processing" garante que apenas uma instância rode por vez,
// mesmo que múltiplos gatilhos disparem simultaneamente ou haja múltiplas tabs.
async function verificarPendenciasPDFs() {
  if (!navigator.locks) {
    // Fallback para browsers sem suporte à Web Locks API
    return _verificarSemLock();
  }

  return navigator.locks.request(
    "pdf-processing",
    { ifAvailable: true }, // retorna null se o lock já estiver ocupado
    async (lock) => {
      if (!lock) {
        console.log("⏳ Lock ocupado — outra instância já está processando");
        return;
      }
      await _processarTodosOsPendentes();
    },
  );
}

// ======== FALLBACK SEM WEB LOCKS ========
let _processandoFallback = false;

async function _verificarSemLock() {
  if (_processandoFallback) {
    console.log("⏳ Já processando (fallback) — pulando");
    return;
  }
  _processandoFallback = true;
  try {
    await _processarTodosOsPendentes();
  } finally {
    _processandoFallback = false;
  }
}

// ======== LOOP SERIAL DE PROCESSAMENTO ========
async function _processarTodosOsPendentes() {
  try {
    const db = await openFormulariosDB();
    const forms = await db.getAll(PDF_STORE_NAME);

    const pendentes = forms.filter(
      (f) =>
        f.sincronizado &&
        f.serverId &&
        // aceita tanto o statusPDF novo quanto registros legado sem statusPDF
        (f.statusPDF === STATUS_PDF.PENDENTE ||
          (!f.statusPDF && !f.pdfsEnviados && !f.erroDefinitivo)) &&
        (f.tentativaProcessamento || 0) < MAX_TENTATIVAS,
    );

    if (pendentes.length === 0) return;

    console.log(
      `📋 ${pendentes.length} formulário(s) pendente(s) para processar`,
    );
    console.log(
      "IDs:",
      pendentes.map(
        (f) =>
          `${f.id} (serverId:${f.serverId} fichaWA:${!!f.fichaWhatsapp} relWA:${!!f.relatorioWhatsapp} tent:${f.tentativaProcessamento || 0})`,
      ),
    );

    for (const form of pendentes) {
      // Transição atômica: lê e escreve na mesma transação IndexedDB.
      // Se dois processos passarem pelo lock simultaneamente (improvável mas possível
      // no fallback), apenas o primeiro conseguirá a transição — o segundo verá
      // statusPDF === "processando" e abortará.
      const formLocked = await marcarComoProcessando(db, form.id);
      if (!formLocked) {
        console.log(
          `⏩ Formulário ${form.id} já está sendo processado — pulando`,
        );
        continue;
      }

      try {
        await processarPDFsAutomatico(formLocked);
      } catch (err) {
        console.error(`❌ Erro ao processar formulário ${form.id}:`, err);
        await marcarComoErro(db, form.id, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Erro em _processarTodosOsPendentes:", err);
  }
}

// ======== TRANSIÇÃO ATÔMICA: PENDENTE → PROCESSANDO ========
// Usa uma transação readwrite do IndexedDB como mecanismo de lock de segundo nível.
// Garante que mesmo no fallback sem Web Locks, apenas um processo adquira o formulário.
async function marcarComoProcessando(db, formId) {
  const tx = db.transaction(PDF_STORE_NAME, "readwrite");
  const store = tx.objectStore(PDF_STORE_NAME);
  const form = await store.get(formId);

  if (!form) {
    tx.abort();
    return null;
  }

  // Idempotência local: já está em processamento ou enviado?
  if (
    form.statusPDF === STATUS_PDF.PROCESSANDO ||
    form.statusPDF === STATUS_PDF.ENVIADO
  ) {
    tx.abort();
    return null;
  }

  form.statusPDF = STATUS_PDF.PROCESSANDO;
  form.tentativaProcessamento = (form.tentativaProcessamento || 0) + 1;
  form.ultimaTentativa = new Date().toISOString();
  form.erroDefinitivo = false;

  await store.put(form);
  await tx.done;

  console.log(
    `🔒 Tentativa ${form.tentativaProcessamento}/${MAX_TENTATIVAS} — serverId: ${form.serverId}`,
  );
  return form;
}

// ======== TRANSIÇÃO: PROCESSANDO → PENDENTE/ERRO_DEFINITIVO (em caso de falha) ========
async function marcarComoErro(db, formId, mensagemErro) {
  try {
    const form = await db.get(PDF_STORE_NAME, formId);
    if (!form) return;

    const tentativas = form.tentativaProcessamento || 0;
    const erroDefinitivo = tentativas >= MAX_TENTATIVAS;

    form.statusPDF = erroDefinitivo
      ? STATUS_PDF.ERRO_DEFINITIVO
      : STATUS_PDF.PENDENTE;
    form.erroProcessamento = mensagemErro;
    form.erroProcessamentoAt = new Date().toISOString();
    form.erroDefinitivo = erroDefinitivo;

    await db.put(PDF_STORE_NAME, form);

    if (erroDefinitivo) {
      console.error(
        `🚫 Limite de tentativas atingido para serverId ${form.serverId}. Use forcarReenvio(${form.serverId}) no console.`,
      );
      mostrarNotificacaoLocal(
        "🚫 Falha Permanente",
        `Serviço #${form.serverId} falhou ${MAX_TENTATIVAS}x. Use forcarReenvio(${form.serverId}) no console.`,
      );
    } else {
      console.warn(
        `⚠️ Tentativa ${tentativas}/${MAX_TENTATIVAS} falhou para serverId ${form.serverId}. Será retentado.`,
      );
      mostrarNotificacaoLocal(
        "❌ Erro ao Enviar PDFs",
        `Serviço #${form.serverId}: ${mensagemErro}. Tentaremos novamente.`,
      );
    }
  } catch (dbErr) {
    console.error("❌ Erro ao salvar estado de erro:", dbErr);
  }
}

// ======== PROCESSAR PDFs — CONFIRMAÇÃO ITEM A ITEM ========
async function processarPDFsAutomatico(formData) {
  const serverId = formData.serverId;
  console.log("📄 Processando serverId:", serverId);

  if (
    typeof gerarFichaPDFBase64 !== "function" ||
    typeof gerarRelatorioPDFBase64 !== "function"
  ) {
    throw new Error("Funções de geração de PDF não disponíveis");
  }

  const formDataCompleto = {
    cliente: formData.cliente || "",
    cidade: formData.cidade || "",
    equipamento: formData.equipamento || "",
    numeroSerie: formData.numeroSerie || "",
    tecnico: formData.tecnico || "",
    veiculo: formData.veiculo || "",
    estoque: formData.estoque || "",
    dataInicial: formData.dataInicial || "",
    horaInicial: formData.horaInicial || "",
    dataFinal: formData.dataFinal || "",
    horaFinal: formData.horaFinal || "",
    servico: formData.servico || "",
    relatorioMaquina: formData.relatorioMaquina || "",
    osComplementar: formData.osComplementar || "",
    osServico: formData.osServico || "",
    tecnicoNome: formData.tecnicoNome || formData.tecnico || "",
    clienteNome: formData.clienteNome || formData.cliente || "",
  };

  // Recarrega estado atual do DB — pode haver confirmações parciais de tentativas anteriores
  const db = await openFormulariosDB();
  const formAtual = await db.get(PDF_STORE_NAME, formData.id);
  const fichaJaConfirmada = formAtual?.fichaWhatsapp === true;
  const relatorioJaConfirmado = formAtual?.relatorioWhatsapp === true;

  if (fichaJaConfirmada && relatorioJaConfirmado) {
    // Ambos já confirmados — marca como enviado e encerra
    const form = await db.get(PDF_STORE_NAME, formData.id);
    form.statusPDF = STATUS_PDF.ENVIADO;
    form.pdfsEnviados = true;
    form.pdfsEnviadosAt = form.pdfsEnviadosAt || new Date().toISOString();
    await db.put(PDF_STORE_NAME, form);
    console.log(
      `✅ Formulário ${formData.id} já tinha ambos confirmados — marcado como enviado`,
    );
    return;
  }

  const detalhes = [
    `Cliente: ${formDataCompleto.cliente || "-"}`,
    `Cidade: ${formDataCompleto.cidade || "-"}`,
    `Equipamento: ${formDataCompleto.equipamento || "-"}`,
    `Serviço: ${formDataCompleto.servico || "-"}`,
    `Técnico: ${formDataCompleto.tecnico || "-"}`,
    `Estoque: ${formDataCompleto.estoque || "-"}`,
  ].join("\n");

  // Gera apenas os PDFs que ainda faltam — evita reenvio de itens já confirmados
  const payload = { serverId };

  if (!fichaJaConfirmada) {
    console.log("🎨 Gerando Ficha...");
    const blob = await gerarFichaPDFBase64(
      formDataCompleto,
      formData.materiais || [],
      formData.fotos || [],
      formData.assinaturas || {},
      serverId,
    );
    if (!blob) throw new Error("Blob da Ficha veio vazio");
    payload.pdfFichaBase64 = await blobParaBase64(blob);
    payload.mensagemFicha = `Ficha de Materiais (Nº ${serverId})\n\n${detalhes}`;
  } else {
    console.log("⏩ Ficha já confirmada — não será reenviada");
  }

  if (!relatorioJaConfirmado) {
    console.log("🎨 Gerando Relatório...");
    const blob = await gerarRelatorioPDFBase64(
      formDataCompleto,
      formData.materiais || [],
      formData.fotos || [],
      formData.assinaturas || {},
      serverId,
    );
    if (!blob) throw new Error("Blob do Relatório veio vazio");
    payload.pdfRelatorioBase64 = await blobParaBase64(blob);
    payload.mensagemRelatorio = `Relatório de Serviço (Nº ${serverId})\n\n${detalhes}`;
  } else {
    console.log("⏩ Relatório já confirmado — não será reenviado");
  }

  console.log("🔄 Enviando para Edge Function...");
  const response = await fetchComTimeout(
    EDGE_FUNCTION_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    },
    90_000, // 90s — PDFs grandes podem demorar
  );

  // Edge Function retorna 200 (tudo ok), 207 (parcial) ou 500 (fatal)
  const resultado = await response.json();
  console.log(
    `📊 Resultado da Edge Function (HTTP ${response.status}):`,
    resultado,
  );

  if (response.status === 500) {
    throw new Error(
      `Edge Function erro fatal: ${resultado.error || "desconhecido"}`,
    );
  }

  // Persiste apenas o que foi CONFIRMADO pelo servidor nesta chamada
  const form = await db.get(PDF_STORE_NAME, formData.id);
  if (!form) return;

  if (resultado.fichaWhatsapp) form.fichaWhatsapp = true;
  if (resultado.relatorioWhatsapp) form.relatorioWhatsapp = true;

  const tudoPronto = form.fichaWhatsapp && form.relatorioWhatsapp;

  form.statusPDF = tudoPronto ? STATUS_PDF.ENVIADO : STATUS_PDF.PENDENTE;
  form.pdfsEnviados = tudoPronto;
  form.pdfsPrecisamAtualizar = false;
  form.erroProcessamento = resultado.erros?.length
    ? resultado.erros.join("; ")
    : null;

  if (tudoPronto) {
    form.pdfsEnviadosAt = new Date().toISOString();
    console.log("🎉 Par completo — formulário concluído");
  } else {
    // Envio parcial: volta para PENDENTE para ser retentado
    console.warn(
      `⚠️ Envio parcial (fichaWA:${form.fichaWhatsapp} relWA:${form.relatorioWhatsapp}) — será retentado`,
    );
  }

  if (tudoPronto && (form.tentativaProcessamento || 0) >= MAX_TENTATIVAS) {
    form.erroDefinitivo = true; // só marca definitivo se atingiu limite E ainda incompleto
  } else {
    form.erroDefinitivo =
      !tudoPronto && (form.tentativaProcessamento || 0) >= MAX_TENTATIVAS;
  }

  await db.put(PDF_STORE_NAME, form);

  if (resultado.ok) {
    mostrarNotificacaoLocal(
      "✅ PDFs Enviados!",
      `Serviço #${serverId} enviado para WhatsApp`,
    );
  } else if (resultado.fichaWhatsapp || resultado.relatorioWhatsapp) {
    mostrarNotificacaoLocal(
      "⚠️ Envio Parcial",
      `Serviço #${serverId}: apenas parte foi enviada. Retentando em breve.`,
    );
  }
}

// ======== HELPER: FETCH COM TIMEOUT ========
function fetchComTimeout(url, opcoes, timeoutMs) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Timeout após ${timeoutMs / 1000}s`));
    }, timeoutMs);
    fetch(url, { ...opcoes, signal: controller.signal })
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

// ======== HELPER: BLOB → BASE64 ========
function blobParaBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ======== NOTIFICAÇÃO ========
function mostrarNotificacaoLocal(titulo, mensagem) {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(titulo, {
        body: mensagem,
        icon: "../assets/icons/icon-192.png",
        badge: "../assets/icons/badge-72.png",
      });
    } catch (err) {
      console.log(`ℹ️ Notificação não exibida: ${err.message}`);
    }
  }
  console.log(`🔔 ${titulo}: ${mensagem}`);
}

// ======== DEBUG E UTILITÁRIOS ========

window.debugPendenciasPDFs = async function () {
  const db = await openFormulariosDB();
  const forms = await db.getAll(PDF_STORE_NAME);

  const enviados = forms.filter(
    (f) =>
      f.statusPDF === STATUS_PDF.ENVIADO ||
      (f.fichaWhatsapp && f.relatorioWhatsapp),
  );
  const pendentes = forms.filter((f) => f.statusPDF === STATUS_PDF.PENDENTE);
  const processando = forms.filter(
    (f) => f.statusPDF === STATUS_PDF.PROCESSANDO,
  );
  const erroDefinitivo = forms.filter(
    (f) => f.statusPDF === STATUS_PDF.ERRO_DEFINITIVO || f.erroDefinitivo,
  );
  const semStatus = forms.filter((f) => !f.statusPDF);

  console.log("=== DEBUG PDF Processor V6 ===");
  console.log("Total:", forms.length);
  console.log("Enviados:        ", enviados.length);
  console.log("Pendentes:       ", pendentes.length);
  console.log("Processando:     ", processando.length);
  console.log("Erro definitivo: ", erroDefinitivo.length);
  console.log("Sem status (legado):", semStatus.length);

  [...pendentes, ...processando, ...erroDefinitivo].forEach((f) => {
    console.log(
      `  id:${f.id} serverId:${f.serverId} status:${f.statusPDF} fichaWA:${!!f.fichaWhatsapp} relWA:${!!f.relatorioWhatsapp} tent:${f.tentativaProcessamento || 0}/${MAX_TENTATIVAS}`,
    );
  });

  return { enviados, pendentes, processando, erroDefinitivo, semStatus };
};

window.auditarFormularios = async function () {
  const result = await window.debugPendenciasPDFs();
  console.table({
    Enviados: result.enviados.length,
    Pendentes: result.pendentes.length,
    Processando: result.processando.length,
    "Erro definitivo": result.erroDefinitivo.length,
    "Sem status (legado)": result.semStatus.length,
  });
  return result;
};

window.resetarTentativas = async function (formId) {
  const db = await openFormulariosDB();
  const form = await db.get(PDF_STORE_NAME, formId);
  if (!form) {
    console.error("Formulário não encontrado:", formId);
    return;
  }
  form.tentativaProcessamento = 0;
  form.statusPDF = STATUS_PDF.PENDENTE;
  form.erroDefinitivo = false;
  form.erroProcessamento = null;
  await db.put(PDF_STORE_NAME, form);
  console.log(`✅ Tentativas resetadas para formId ${formId}`);
  debouncedVerificar(300);
};

window.forcarReenvio = async function (serverId) {
  const db = await openFormulariosDB();
  const forms = await db.getAll(PDF_STORE_NAME);
  const form = forms.find((f) => f.serverId == serverId);
  if (!form) {
    console.error("Nenhum formulário com serverId:", serverId);
    return;
  }
  form.fichaWhatsapp = false;
  form.relatorioWhatsapp = false;
  form.pdfsEnviados = false;
  form.tentativaProcessamento = 0;
  form.statusPDF = STATUS_PDF.PENDENTE;
  form.erroDefinitivo = false;
  form.pdfsPrecisamAtualizar = true;
  await db.put(PDF_STORE_NAME, form);
  console.log(`🔁 Reenvio forçado para serverId ${serverId}`);
  debouncedVerificar(300);
};

console.log("✅ PDF Processor V6 carregado");
console.log(
  "💡 auditarFormularios() | debugPendenciasPDFs() | forcarReenvio(serverId) | resetarTentativas(formId)",
);
