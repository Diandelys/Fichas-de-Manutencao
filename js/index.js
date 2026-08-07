// =====================
// Main Application Logic
// =====================
const estoqueData = [
  { codigo: "9318", material: "ABRAÇADEIRA NYLON 100MMX2,5MM" },
  { codigo: "3296", material: "ABRAÇADEIRA NYLON 4,6MMX200MM" },
  { codigo: "12525", material: "ABRAÇADEIRA DAS GAVETAS SEQ" },
  { codigo: "11292", material: "ABRAÇADEIRAA COLETA SOLO" },
  { codigo: "9763", material: "ARRUELA LISA 1/2 GVZ" },
  { codigo: "9320", material: "ARRUELA LISA 1/4 INOX" },
  { codigo: "9472", material: "ARRUELA LISA M4 INOX" },
  { codigo: "9619", material: "BARRA DE PINOS 1X40 VIAS 11,2MM 180ş" },
  { codigo: "9617", material: "BARRA DE PINOS 1X40 VIAS 14,5MM 90ş" },
  { codigo: "9970", material: "BARRA DE PINOS 1X40 VIAS 17MM 90ş" },
  { codigo: "9607", material: "BARRA ROSCADA M4 INOX" },
  { codigo: "7207", material: "BATERIA 12VCC 7A" },
  { codigo: "3592", material: "BATERIA 12VCC 1,3A" },
  { codigo: "10822", material: "BATERIA 5VCC" },
  { codigo: "9447", material: "BOBINA 220V" },
  { codigo: "9605", material: "BLOCO DE CONTATO NO" },
  { codigo: "9425", material: "BLOCO DE CONTATO NF" },
  { codigo: "10536", material: "BORRACHA DE VEDAÇÃO" },
  { codigo: "11272", material: "BORNE SACK FUSIVEL" },
  { codigo: "9423", material: "BORNE SACK BEGE" },
  { codigo: "12485", material: "BORNE SACK AZUL" },
  { codigo: "9399", material: "BOTÃO DE PULSO" },
  { codigo: "9415", material: "BOTÃO DE EMERGÊNCIA" },
  { codigo: "2454", material: "BUCHA M8" },
  { codigo: "9964", material: "BUCHA METALICA MACHO 1/4" },
  { codigo: "11597", material: "BUCHA METALICA MACHO 1/8" },
  { codigo: "4002", material: "CABO DE ALIMENTAÇÃO 2,5MM TRIPOLAR" },
  { codigo: "9478", material: "CABO AWG 4X" },
  { codigo: "10570", material: "CABO DE AÇO 1/8 GALV 3.2" },
  { codigo: "10051", material: "CABO FLAT COLORIDO 20 VIAS" },
  { codigo: "9871", material: "CABO DE COMANDO 1X0,5MM AZUL" },
  { codigo: "10541", material: "CABO FLEX 1,5MM VERDE" },
  { codigo: "9875", material: "CABO VERMELHO 1X0,5MM" },
  { codigo: "9873", material: "CABO PRETO 1X0,5MM" },
  { codigo: "10551", material: "CABO PP 3X0,5MM" },
  { codigo: "2642", material: "CABO PP 2X1MM" },
  { codigo: "10550", material: "CABO PP 2X0,5MM" },
  { codigo: "6662", material: "CABO USB CONTROLADOR" },
  { codigo: "9849", material: "CABO DE REDE" },
  { codigo: "10654", material: "CASE DO RASPBERRY" },
  { codigo: "8257", material: "CAIXA DE INTERLIGAÇÃO SENSORES MAX E MIN" },
  { codigo: "8249", material: "CAIXA DE INTERLIGAÇÃO DAS CÉLULAS" },
  { codigo: "9467", material: "CAIXA OPACA 190X140X70" },
  { codigo: "9400", material: "CAIXA BX01 - 1 FURO 76X70X60" },
  { codigo: "9401", material: "CAIXA BX02 - 2 FURO" },
  { codigo: "11602", material: "KIT CAMERA MAIX BIT" },
  { codigo: "9962", material: "CAPACITOR POLIESTER 100K 63V" },
  { codigo: "9271", material: "CAPACITOR 47NF 400V" },
  { codigo: "1106", material: "CARREGADOR 12VCC 0,8A" },
  { codigo: "12010", material: "FONTE DE PAREDE 5 VCC 1A" },
  { codigo: "9212", material: "FONTE 12VCC 2A DE PAREDE" },
  { codigo: "9444", material: "FONTE NOBREAK FULL" },
  { codigo: "9844", material: "CARTÃO SD" },
  { codigo: "12658", material: "CÉLULA 20KG" },
  { codigo: "8750", material: "CÉLULA DE CARGA BSPH10 100KG" },
  { codigo: "9476", material: "CÉLULA DE CARGA Z 500KG" },
  { codigo: "9693", material: "CÉLULA DE CARGA Z 100KG" },
  { codigo: "9330", material: "CÉLULA DE CARGA Z 50KG" },
  { codigo: "6743", material: "CHAPA DE PROTEÇÃO DO CARTÃO" },
  { codigo: "9885", material: "CHAPINHA DE Nº DE SÉRIE" },
  { codigo: "9876", material: "CHAVE ALAVANCA LD" },
  { codigo: "9397", material: "CHAVE LDL" },
  { codigo: "10569", material: "CLIP PARA CABO DE AÇO 1/8 - 3,2" },
  { codigo: "5670", material: "CONTATOR 12 A 220VAC" },
  { codigo: "9402", material: "CHAVE SELETORA XB2 2 POSIÇÕES" },
  { codigo: "9636", material: "CONECTOR MIKE FEMEA 4 PINOS" },
  { codigo: "9281", material: "CONECTOR MIKE MACHO 4 PINOS" },
  { codigo: "12739", material: "CONEXAO RETA 1/4XM4" },
  { codigo: "12741", material: "CONEXAO RETA 1/4XM6" },
  { codigo: "3882", material: "CONEXÃO RETA 1/8XM4" },
  { codigo: "10012", material: "CONEXÃO RETA LATÃO" },
  { codigo: "12596", material: "CONEXAO UNIÃO RETA 8MM" },
  { codigo: "12594", material: "CONJUNTO LUBRIFIL MINI 1/4" },
  { codigo: "10580", material: "FONTE HI-LINK 12V" },
  { codigo: "11812", material: "FONTE HI-LINK 5V" },
  { codigo: "10828", material: "CONECTOR MICRO USB PS/SEL WIFI" },
  { codigo: "9633", material: "CORDA NATURAL BRANCA 4MM" },
  { codigo: "10655", material: "COOLER PARA RASPBERRY" },
  { codigo: "9609", material: "CORRENTE DE AÇO" },
  { codigo: "9690", material: "DIODO 1N4007" },
  { codigo: "9845", material: "ENGATE RAPIDO 1/4 MACHO" },
  { codigo: "9842", material: "ENGATE RAPIDO 1/4 FEMÊA" },
  { codigo: "9260", material: "ESPAÇADOR NYLON GRANDE 7X3X10" },
  { codigo: "9263", material: "ESPAÇADOR NYLON GRANDE 7X3X10" },
  { codigo: "9373", material: "ESPAÇADOR C/ ROSCA" },
  { codigo: "9334", material: "FUSIVEL 1A PEQUENO" },
  { codigo: "9826", material: "FUSIVEL 0,5A PEQUENO" },
  { codigo: "9867", material: "GERENCIADOR DO RASP PAINEL IHM" },
  { codigo: "9258", material: "ISOLADOR CHAPEU" },
  { codigo: "12269", material: "INDICADOR SELAVES WI-FI" },
  { codigo: "3090", material: "INDICADOR SP-501" },
  { codigo: "10808", material: "INDICADOR COLETA SOLO" },
  { codigo: "12893", material: "HUB" },
  { codigo: "9694", material: "KIT BOTÃO REGISTRA" },
  { codigo: "8330", material: "KIT DISTORCEDOR" },
  { codigo: "5209", material: "KIT ISOLADOR SISTEMA FIXO" },
  { codigo: "10573", material: "KIT ISOLADOR SISTEMA MOVEL" },
  { codigo: "9396", material: "MASCARA SP-300" },
  { codigo: "11052", material: "MASCARA DO TOUCH PAINEL IHM" },
  { codigo: "9638", material: "MICRO SD" },
  { codigo: "9554", material: "LED VERMELHO DIFUSO" },
  { codigo: "13728", material: "LED BICOLOR" },
  { codigo: "9857", material: "LUVA 1/4 METALICA SEXTAVADA" },
  { codigo: "9856", material: "MANGUEIRA PU6" },
  { codigo: "9961", material: "MANGUEIRA PU8" },
  { codigo: "9379", material: "MÓDULO RELÓGIO RASPBERRY" },
  { codigo: "9542", material: "MÓDULO RELÓGIO DO INDICADOR TRADICIONAL" },
  { codigo: "4719", material: "MÓDULO AD" },
  { codigo: "9547", material: "MÓDULO DE LEITOR SD" },
  { codigo: "10825", material: "MÓDULO DE LEITOR MICRO SD" },
  { codigo: "9546", material: "MÓDULO RELÉ 16 CANAIS" },
  { codigo: "9481", material: "MÓDULO RELÉ 4 CANAIS 12VCC" },
  { codigo: "9387", material: "MÓDULO DISPLAY LCD 2 LINHAS" },
  { codigo: "10656", material: "MONITOR TOUCH SCREEN" },
  { codigo: "6560", material: "MOSQUETÃO" },
  { codigo: "9948", material: "ÓLEO DE COMPRESSOR" },
  { codigo: "3154", material: "ÓLEO PNEUMATICO" },
  { codigo: "9338", material: "PARAFUSO PHILIPS 2,5X20" },
  { codigo: "9342", material: "PARAFUSO PHILIPS M4X12" },
  { codigo: "9847", material: "PARAFUSO OLIAL 6MM" },
  { codigo: "9338", material: "PARAFUSO PHILIPS 2,5X20MM INOX" },
  { codigo: "9339", material: "PARAFUSO PHILIPS CONICO 2,5X20MM INOX" },
  { codigo: "10763", material: "PF PHILIPS 3,5X9,5" },
  { codigo: "10579", material: "PARAFUSO PHILIPS M3X25MM INOX" },
  { codigo: "9342", material: "PARAFUSO PHILIPS M4X12MM INOX" },
  { codigo: "9767", material: "PARAFUSO SEXTAVADO M10X60 INOX" },
  { codigo: "9768", material: "PARAFUSO SEXTAVADO M6X16MM INOX" },
  { codigo: "2767", material: "PARAFUSO SEXTAVADO M8X55MM INOX" },
  { codigo: "9483", material: "PARAFUSO ALLEN ABAULADO M4X12MM" },
  { codigo: "9769", material: "PARAFUSO ALLEN CILINDRICO M4X20MM" },
  { codigo: "9350", material: "PARAFUSO ALLEN CILINDRICO M6X10MM" },
  { codigo: "10549", material: "PARAFUSO ALLEN CONICO M4X35MM" },
  { codigo: "9734", material: "PARAFUSO ALLEN CONICO M6X16MM" },
  { codigo: "10117", material: "PARAFUSO BROCANTE 5,5X25MM" },
  { codigo: "10571", material: "PARAFUSO SOBERBO SEXTAVADO 1/4X50MM" },
  { codigo: "10572", material: "PARAFUSO SEXTAVADO 1/4X3/4" },
  { codigo: "9266", material: "PARAFUSO NYLON FENDA" },
  { codigo: "11852", material: "PRESILHA COLETA SOLO" },
  { codigo: "12728", material: "PISTÃO 25X250MM" },
  { codigo: "9965", material: "PISTÃO MINI 16X60MM" },
  { codigo: "9442", material: "PISTÃO 25X125MM" },
  { codigo: "1693", material: "PISTÃO 25X150MM" },
  { codigo: "6158", material: "PILHA DO CLOCK" },
  { codigo: "10041", material: "PLACA LED MONTADA DO SEQ" },
  { codigo: "3415", material: "PLC DE CORTE SP-501" },
  { codigo: "2818", material: "PLC DE CORTE SP-300" },
  { codigo: "9389", material: "PLC CONTROLADOR MEGA" },
  { codigo: "9458", material: "PLC CONTROLADOR UNO" },
  { codigo: "10790", material: "CONTROLADOR ESP-32 PS/SEL WIFI" },
  { codigo: "9882", material: "PLC SEL-BOX 2.0" },
  { codigo: "10790", material: "CONTROLADOR WI-FI" },
  { codigo: "12340", material: "PLACA RASPBERRY" },
  { codigo: "13214", material: "PALCA CS MONTADA" },
  { codigo: "8125", material: "INDICADOR TRADICIONAL" },
  { codigo: "7351", material: "INDICADOR IHM" },
  { codigo: "8127", material: "ESCRAVO" },
  { codigo: "9550", material: "PLATAFORMA INFERIOR CÉLULA" },
  { codigo: "3437", material: "PLATAFORMA SUPERIOR CÉLULA" },
  { codigo: "12616", material: "PONTEIRA ANGULAR" },
  { codigo: "12618", material: "PONTEIRA ROTULAR" },
  { codigo: "9781", material: "PORCA M6 INOX" },
  { codigo: "9359", material: "PORLOCK M10 INOX" },
  { codigo: "9360", material: "PORLOCK M3" },
  { codigo: "9784", material: "PORCA 1/4" },
  { codigo: "9361", material: "PORLOCK M4" },
  { codigo: "9362", material: "PORLOCK M6" },
  { codigo: "3256", material: "PORLOCK M8" },
  { codigo: "9363", material: "PORCA 2,5 INOX" },
  { codigo: "9779", material: "PORCA HASTE DOS PISTÕES 25X125/150/250" },
  { codigo: "9748", material: "PORCA HASTE DOS PISTÕES MINI 16X80" },
  { codigo: "9264", material: "PORCA NYLON" },
  { codigo: "9274", material: "PORTA FUSIVEL" },
  { codigo: "9549", material: "PG 11" },
  { codigo: "9364", material: "PG7" },
  { codigo: "9532", material: "REGULADOR 12V P/ 5V" },
  { codigo: "9112", material: "REGULADOR 7812" },
  { codigo: "9900", material: "RELÉ ACOPLADOR 12V" },
  { codigo: "11978", material: "BASE DO RELÉ ACOPLADOR SLIM" },
  { codigo: "11981", material: "RELÉ ACOPLADOR SLIM 220V" },
  { codigo: "10653", material: "RELÉ TÉRMICO 1,6 - 2,5 A" },
  { codigo: "4595", material: "RELÉ TERMICO 4,0 - 6,3A" },
  { codigo: "12610", material: "REGULADOR DE FLUXO 6X1/8" },
  { codigo: "9934", material: "RESISTOR 10K2 1% 1/4W" },
  { codigo: "9930", material: "RJ45" },
  { codigo: "11181", material: "ROTEADOR TP-LINK" },
  { codigo: "12206", material: "SENSOR CAPACITIVO CA30" },
  { codigo: "9494", material: "SENSOR BANANA" },
  { codigo: "12608", material: "SILENCIADOR BRONZE 1/8" },
  { codigo: "13213", material: "SLAT COLETA SOLO" },
  { codigo: "11648", material: "SINALEIRO LED VERDE - 110/220V" },
  { codigo: "9273", material: "SINDAL 10 MM" },
  { codigo: "10050", material: "SINDAL 16 MM" },
  { codigo: "9557", material: "SUPORTE DO LED 5MM" },
  { codigo: "9978", material: "TECLADO BT" },
  { codigo: "9836", material: "TECLADO BD15-SD/PS" },
  { codigo: "9859", material: "TECLADO BD15-SD/SEL" },
  { codigo: "9398", material: "TECLADO BD15-SEL" },
  { codigo: "9405", material: "TECLADO SP-501 GRANDE" },
  { codigo: "9404", material: "TECLADO SP-501 PEQUENO" },
  { codigo: "8895", material: "TECLADO PS/SEL WIFI" },
  { codigo: "9956", material: "TECLADO SEQUENCIAL" },
  { codigo: "9393", material: "TERMINAL FEMEA TOTAL" },
  { codigo: "9368", material: "TERMINAL OLHAL AZUL" },
  { codigo: "9368", material: "TERMINAL OLHAL PEQUENO VERMELHO" },
  { codigo: "10575", material: "TERMINAL GARFO PEQUENO VERMELHO" },
  { codigo: "9911", material: "TERMINAL GARFO AZUL" },
  { codigo: "9391", material: "TERMINAL TUBULAR 0,75MM BRANCO" },
  { codigo: "9431", material: "TERMINAL TUBULAR 1MM VERMELHO" },
  { codigo: "9432", material: "TERMINAL TUBULAR 1,5 MM PRETO" },
  { codigo: "9870", material: "TERMINAL TUBULAR 1MM DUPLO VERMELHO" },
  { codigo: "9983", material: "T PU8" },
  { codigo: "9984", material: "ABRAÇADEIRA T PU8" },
  { codigo: "12598", material: "T MULTIPLO PU6" },
  { codigo: "10022", material: "TOMADA FEMEA" },
  { codigo: "8820", material: "VALVULA ESFERA 1/4" },
  { codigo: "12575", material: "VALVULA SOLENÓIDE 220V" },
  { codigo: "12576", material: "VALVULA SOLENÓIDE 12V" },
  { codigo: "7212", material: "ACRILICO DA BOBINA DA VALVULA" },
  { codigo: "9747", material: "PORCA PROT. BOTÃO REGISTRA" },
  { codigo: "10766", material: "PESO PADRÃO 1KG" },
];

let state = {
  fotos: [],
  materiais: [],
  formularioEmEdicaoId: null,
  assinaturas: {
    cliente: null,
    tecnico: null,
  },
};

// ======== Configuração de Sincronização ========
const SYNC_CONFIG = {
  endpoint: "https://vps.pesoexato.com/servico_set",
  interval: 30000, // 30 segundos
  maxRetention: 5 * 7 * 24 * 60 * 60 * 1000, // 5 semanas
};

const AUTO_SYNC_STORAGE_KEY = "syncAutoBlocked";
const FORM_DRAFT_STORAGE_KEY = "formularioDraft";
let draftSaveTimeout;

// ======== Gerador de Chave Única ========
function generateUniqueKey() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `form_${timestamp}_${randomStr}`;
}

// ======== Registro de Background Sync ========
async function registrarBackgroundSync() {
  if (syncState.autoSyncBlocked) {
    return false;
  }

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register("background-sync-formularios");
      console.log(
        "✅ Background Sync registrado para sincronização em background",
      );
      return true;
    } catch (error) {
      console.log("⚠️ Background Sync não disponível:", error);
      return false;
    }
  }
  return false;
}

// ======== Estado da sincronização ========
let syncState = {
  pendingCount: 0,
  isSyncing: false,
  syncInterval: null,
  autoSyncBlocked: false,
};

// ======== Elementos da interface ========
let syncBtn, syncBadge, syncIcon, toggleAutoSyncBtn, toggleAutoSyncText;

// Elementos DOM
// Cache de elementos para melhor performance
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const exportBtn = document.getElementById("export-btn");
const fotosInput = document.getElementById("fotos-input");
const addFotosBtn = document.getElementById("add-fotos-btn");
const fotosPreview = document.getElementById("fotos-preview");
const materialInput = document.getElementById("material-input");
const materialQtd = document.getElementById("material-qtd");
const addMaterialBtn = document.getElementById("add-material-btn");
const materiaisLista = document.getElementById("materiais-lista");
const materiaisDatalist = document.getElementById("materiais-list");
const equipamentoSelect = document.getElementById("equipamento");
const equipamentoOutro = document.getElementById("equipamento-outro");
const notification = document.getElementById("notification");
const notificationIcon = document.getElementById("notification-icon");
const notificationText = document.getElementById("notification-text");
const imageModal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const modalClose = document.querySelector(".modal-close");

// Configuração dos canvas de assinatura
const canvasCliente = document.getElementById("assinatura-cliente");
const canvasTecnico = document.getElementById("assinatura-tecnico");
const ctxCliente = canvasCliente.getContext("2d");
const ctxTecnico = canvasTecnico.getContext("2d");

let isDrawingCliente = false;
let isDrawingTecnico = false;
let lastXCliente = 0;
let lastYCliente = 0;
let lastXTecnico = 0;
let lastYTecnico = 0;

// Atualiza indicador visual de status da rede
function updateOnlineStatus() {
  const indicators = document.querySelectorAll(".status-indicator");
  const texts = document.querySelectorAll("#status-text, #status-text-desktop");
  const isOnline = navigator.onLine;

  indicators.forEach((ind) => {
    ind.className = isOnline ? "status-indicator status-online" : "status-indicator status-offline";
  });
  texts.forEach((txt) => {
    txt.textContent = isOnline ? "Online" : "Offline";
  });
}

// Event Listeners
// Registra handlers para interações do usuário
function setupEventListeners() {
  exportBtn.addEventListener("click", exportData);
  addFotosBtn.addEventListener("click", () => fotosInput.click());
  fotosInput.addEventListener("change", handleFileSelect);
  addMaterialBtn.addEventListener("click", addMaterial);
  document
    .getElementById("clear-form-btn")
    .addEventListener("click", clearForm);

  materialInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addMaterial();
  });

  document
    .getElementById("limpar-cliente")
    .addEventListener("click", () => clearCanvas("cliente"));
  document
    .getElementById("limpar-tecnico")
    .addEventListener("click", () => clearCanvas("tecnico"));

  equipamentoSelect.addEventListener("change", function () {
    equipamentoOutro.classList.toggle("hidden", this.value !== "OUTRO");
  });

  modalClose.addEventListener("click", () => {
    imageModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.style.display = "none";
    }
  });

  if (document.getElementById("sync-btn")) {
    document.getElementById("sync-btn").addEventListener("click", manualSync);
  }

  if (document.getElementById("toggle-auto-sync-btn")) {
    document
      .getElementById("toggle-auto-sync-btn")
      .addEventListener("click", toggleAutoSyncMode);
  }

  const toggleHeaderControlsBtn = document.getElementById("toggle-header-controls-btn");
  if (toggleHeaderControlsBtn) {
    toggleHeaderControlsBtn.addEventListener("click", () => {
      const container = document.getElementById("header-controls-container");
      const icon = document.getElementById("toggle-controls-icon");
      if (!container) return;
      const isHidden = container.classList.contains("hidden");
      if (isHidden) {
        container.classList.remove("hidden");
        container.classList.add("flex");
        if (icon) {
          icon.classList.remove("fa-chevron-down");
          icon.classList.add("fa-chevron-up");
        }
      } else {
        container.classList.add("hidden");
        container.classList.remove("flex");
        if (icon) {
          icon.classList.remove("fa-chevron-up");
          icon.classList.add("fa-chevron-down");
        }
      }
    });
  }

  document.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", scheduleDraftSave);
    field.addEventListener("change", scheduleDraftSave);
  });
}

// ======== Configuração Canvas ========
function setupSignatureCanvas(canvas, ctx, tipo) {
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  function draw(x, y, isCliente) {
    const config = isCliente
      ? {
        ctx: ctxCliente,
        drawing: isDrawingCliente,
        lastX: lastXCliente,
        lastY: lastYCliente,
      }
      : {
        ctx: ctxTecnico,
        drawing: isDrawingTecnico,
        lastX: lastXTecnico,
        lastY: lastYTecnico,
      };

    if (!config.drawing) return;

    config.ctx.beginPath();
    config.ctx.moveTo(config.lastX, config.lastY);
    config.ctx.lineTo(x, y);
    config.ctx.stroke();

    if (isCliente) {
      lastXCliente = x;
      lastYCliente = y;
      state.assinaturas.cliente = canvas.toDataURL();
    } else {
      lastXTecnico = x;
      lastYTecnico = y;
      state.assinaturas.tecnico = canvas.toDataURL();
    }
  }

  canvas.addEventListener("mousedown", (e) => {
    const isLocked = document.getElementById(`lock-${tipo}`).checked;
    if (isLocked) return;

    if (tipo === "cliente") {
      isDrawingCliente = true;
      const pos = getMousePos(e);
      lastXCliente = pos.x;
      lastYCliente = pos.y;
    } else {
      isDrawingTecnico = true;
      const pos = getMousePos(e);
      lastXTecnico = pos.x;
      lastYTecnico = pos.y;
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (tipo === "cliente") isDrawingCliente = false;
    else isDrawingTecnico = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    const pos = getMousePos(e);
    draw(pos.x, pos.y, tipo === "cliente");
  });

  canvas.addEventListener("mouseout", () => {
    if (tipo === "cliente") isDrawingCliente = false;
    else isDrawingTecnico = false;
  });

  canvas.addEventListener("touchstart", (e) => {
    const isLocked = document.getElementById(`lock-${tipo}`).checked;
    if (isLocked) return;

    e.preventDefault();
    if (tipo === "cliente") {
      isDrawingCliente = true;
      const pos = getTouchPos(e);
      lastXCliente = pos.x;
      lastYCliente = pos.y;
    } else {
      isDrawingTecnico = true;
      const pos = getTouchPos(e);
      lastXTecnico = pos.x;
      lastYTecnico = pos.y;
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    draw(pos.x, pos.y, tipo === "cliente");
  });

  canvas.addEventListener("touchend", () => {
    if (tipo === "cliente") isDrawingCliente = false;
    else isDrawingTecnico = false;
  });

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";
}

// ======== Limpeza Canvas ========
function clearCanvas(tipo) {
  const isLocked = document.getElementById(`lock-${tipo}`).checked;
  if (isLocked) {
    showNotification(
      "Desmarque o bloqueio para limpar a assinatura",
      "warning",
    );
    return;
  }

  if (tipo === "cliente") {
    ctxCliente.clearRect(0, 0, canvasCliente.width, canvasCliente.height);
    state.assinaturas.cliente = null;
  } else {
    ctxTecnico.clearRect(0, 0, canvasTecnico.width, canvasTecnico.height);
    state.assinaturas.tecnico = null;
  }
  scheduleDraftSave();
  showNotification("Assinatura limpa", "info");
}

// ======== Preenchimento autocolplete ========
function populateMaterialsDatalist() {
  estoqueData.forEach((item) => {
    const option = document.createElement("option");
    option.value = `${item.codigo} – ${item.material}`;
    materiaisDatalist.appendChild(option);
  });
}

// ======== Compressão de imagem ========
async function compressImage(base64, maxWidth = 900, quality = 0.65) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");

      const ratio = img.width / img.height;
      if (img.width > maxWidth) {
        canvas.width = maxWidth;
        canvas.height = maxWidth / ratio;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.src = base64;
  });
}

// ======== Handles de upload de arquivos ========
async function handleFileSelect(e) {
  const files = e.target.files;

  if (state.fotos.length + files.length > 10) {
    showNotification("Máximo de 10 arquivos permitidos", "error");
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!file.type.match("image.*")) {
      showNotification("Apenas imagens são permitidas", "error");
      continue;
    }

    const reader = new FileReader();

    reader.onload = (function (file) {
      return async function (e) {
        try {
          showNotification("Processando imagem...", "info");

          const imagemComprimida = await compressImage(
            e.target.result,
            900,
            0.65,
          );

          const fileData = {
            name: file.name,
            type: "image/jpeg",
            data: imagemComprimida,
            timestamp: new Date().toISOString(),
          };

          state.fotos.push(fileData);
          renderPhotoPreview(fileData);
          scheduleDraftSave();
          showNotification("Foto adicionada e otimizada", "success");
        } catch (error) {
          console.error("Erro ao processar imagem:", error);
          showNotification("Erro ao processar imagem", "error");
        }
      };
    })(file);

    reader.readAsDataURL(file);
  }

  fotosInput.value = "";
}

// ======== Configuração Canvas ========
function renderPhotoPreview(fileData) {
  const previewItem = document.createElement("div");
  previewItem.className = "relative group";

  previewItem.innerHTML = `
                <img src="${fileData.data}" class="photo-preview cursor-pointer">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button class="view-photo-btn p-2 bg-white rounded-full shadow-lg text-gray-800 mr-1" data-index="${state.fotos.length - 1}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-photo-btn p-2 bg-white rounded-full shadow-lg text-red-600" data-index="${state.fotos.length - 1}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

  fotosPreview.appendChild(previewItem);

  previewItem
    .querySelector(".view-photo-btn")
    .addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      viewPhoto(index);
    });

  previewItem
    .querySelector(".delete-photo-btn")
    .addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      deletePhoto(index);
    });
}

// ======== Vizualização em Modal ========
function viewPhoto(index) {
  const fileData = state.fotos[index];
  modalImage.src = fileData.data;
  imageModal.style.display = "flex";
}

// ======== Remover foto ========
function deletePhoto(index) {
  state.fotos.splice(index, 1);
  renderPhotos();
  scheduleDraftSave();
  showNotification("Arquivo removido", "info");
}

// ======== Renderização completa da galeria ========
function renderPhotos() {
  fotosPreview.innerHTML = "";

  state.fotos.forEach((fileData, index) => {
    const previewItem = document.createElement("div");
    previewItem.className = "relative group";

    previewItem.innerHTML = `
                    <img src="${fileData.data}" class="photo-preview cursor-pointer">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button class="view-photo-btn p-2 bg-white rounded-full shadow-lg text-gray-800 mr-1" data-index="${index}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="delete-photo-btn p-2 bg-white rounded-full shadow-lg text-red-600" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;

    fotosPreview.appendChild(previewItem);

    previewItem
      .querySelector(".view-photo-btn")
      .addEventListener("click", function () {
        const idx = parseInt(this.getAttribute("data-index"));
        viewPhoto(idx);
      });

    previewItem
      .querySelector(".delete-photo-btn")
      .addEventListener("click", function () {
        const idx = parseInt(this.getAttribute("data-index"));
        deletePhoto(idx);
      });
  });
}

// ======== Adição de material à lista ========
function addMaterial() {
  const material = materialInput.value.trim();
  const qtd = materialQtd.value.trim();

  if (!material || !qtd || Number(qtd) <= 0) {
    showNotification("Preencha o material e a quantidade válida", "error");
    return;
  }

  let codigo = "";
  let descricao = material;

  if (material.indexOf(" – ") !== -1) {
    const parts = material.split(" – ");
    codigo = parts[0].trim();
    descricao = parts.slice(1).join(" – ").trim();
  } else if (/^\d+/.test(material)) {
    codigo = material;
    descricao = "";
  }

  state.materiais.push({
    codigo,
    descricao: descricao || material,
    quantidade: Number(qtd),
  });

  materialInput.value = "";
  materialQtd.value = "";

  renderMateriais();
  scheduleDraftSave();
  showNotification("Material adicionado", "success");
}

// ======== Renderização da lista de materiais ========
function renderMateriais() {
  materiaisLista.innerHTML = "";

  state.materiais.forEach((item, index) => {
    const materialItem = document.createElement("div");
    materialItem.className =
      "flex justify-between items-center bg-gray-50 p-3 rounded-lg";

    materialItem.innerHTML = `
                    <div>
                        <span class="font-medium">${item.descricao}</span>
                        ${item.codigo ? `<span class="text-sm text-gray-500 ml-2">(${item.codigo})</span>` : ""}
                        <span class="text-blue-600 font-semibold ml-2">- ${item.quantidade} un.</span>
                    </div>
                    <button class="delete-material-btn text-red-500 hover:text-red-700 transition" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

    materiaisLista.appendChild(materialItem);
  });

  document.querySelectorAll(".delete-material-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      state.materiais.splice(index, 1);
      renderMateriais();
      scheduleDraftSave();
      showNotification("Material removido", "info");
    });
  });
}

// ======== Coleta de dados do formulário ========
function collectFormData() {
  return {
    cliente: document.getElementById("cliente").value,
    cidade: document.getElementById("cidade").value,
    equipamento: document.getElementById("equipamento").value,
    equipamentoOutro: document.getElementById("equipamento-outro").value,
    tecnico: document.getElementById("tecnico").value,
    servico: document.getElementById("servico").value,
    dataInicial: document.getElementById("data-inicial").value,
    horaInicial: document.getElementById("hora-inicial").value,
    dataFinal: document.getElementById("data-final").value,
    horaFinal: document.getElementById("hora-final").value,
    veiculo: document.getElementById("veiculo").value,
    estoque: document.getElementById("estoque").value,
    numeroSerie: document.getElementById("numero-serie").value,
    relatorioMaquina: document.getElementById("relatorio-maquina").value,
    clienteNome: document.getElementById("cliente-nome").value,
    tecnicoNome: document.getElementById("tecnico-nome").value,
  };
}

// ======== Rascunho do formulário (localStorage) ========
function scheduleDraftSave() {
  clearTimeout(draftSaveTimeout);
  draftSaveTimeout = setTimeout(saveDraftToStorage, 300);
}

function saveDraftToStorage() {
  const draftData = {
    formData: collectFormData(),
    materiais: state.materiais,
    fotos: state.fotos,
    assinaturas: state.assinaturas,
  };

  try {
    localStorage.setItem(FORM_DRAFT_STORAGE_KEY, JSON.stringify(draftData));
  } catch (error) {
    console.warn(
      "Não foi possível salvar o rascunho no armazenamento local:",
      error,
    );
    showNotification(
      "Limite de armazenamento atingido. O rascunho não foi salvo.",
      "error",
    );
  }
}

function loadDraftFromStorage() {
  const rawDraft = localStorage.getItem(FORM_DRAFT_STORAGE_KEY);
  if (!rawDraft) return;

  try {
    const draft = JSON.parse(rawDraft);
    const formData = draft.formData || {};

    for (const key in FIELD_ID_MAP) {
      const elId = FIELD_ID_MAP[key];
      const el = document.getElementById(elId);
      if (!el) continue;

      const value = formData[key] !== undefined ? formData[key] : "";
      el.value = value;

      if (elId === "equipamento") {
        equipamentoOutro.classList.toggle("hidden", el.value !== "OUTRO");
      }
    }

    state.materiais = Array.isArray(draft.materiais) ? draft.materiais : [];
    state.fotos = Array.isArray(draft.fotos) ? draft.fotos : [];
    state.assinaturas = draft.assinaturas || {
      cliente: null,
      tecnico: null,
    };

    renderMateriais();
    renderPhotos();

    if (state.assinaturas.cliente) {
      drawDataUrlOnCanvas(state.assinaturas.cliente, canvasCliente, ctxCliente);
    } else {
      ctxCliente.clearRect(0, 0, canvasCliente.width, canvasCliente.height);
    }

    if (state.assinaturas.tecnico) {
      drawDataUrlOnCanvas(state.assinaturas.tecnico, canvasTecnico, ctxTecnico);
    } else {
      ctxTecnico.clearRect(0, 0, canvasTecnico.width, canvasTecnico.height);
    }
  } catch (error) {
    console.warn("Erro ao recuperar rascunho do formulário:", error);
  }
}

function clearForm() {
  for (const key in FIELD_ID_MAP) {
    const elId = FIELD_ID_MAP[key];
    const el = document.getElementById(elId);
    if (!el) continue;
    el.value = "";
  }

  equipamentoOutro.classList.add("hidden");
  state.materiais = [];
  state.fotos = [];
  state.assinaturas = { cliente: null, tecnico: null };
  state.formularioEmEdicaoId = null;

  renderMateriais();
  renderPhotos();
  ctxCliente.clearRect(0, 0, canvasCliente.width, canvasCliente.height);
  ctxTecnico.clearRect(0, 0, canvasTecnico.width, canvasTecnico.height);
  fotosInput.value = "";
  document.getElementById("lock-cliente").checked = false;
  document.getElementById("lock-tecnico").checked = false;

  localStorage.removeItem(FORM_DRAFT_STORAGE_KEY);
  showNotification("Formulário limpo.", "info");
}

function validateForm() {
  const requiredFields = [
    "cliente",
    "cidade",
    "equipamento",
    "tecnico",
    "servico",
    "data-inicial",
    "hora-inicial",
    "data-final",
    "hora-final",
    "relatorio-maquina",
    "cliente-nome",
    "tecnico-nome",
  ];

  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      showNotification(
        `Preencha o campo: ${field.labels[0].textContent}`,
        "error",
      );
      field.focus();
      return false;
    }
  }

  if (!state.assinaturas.cliente) {
    showNotification("Assinatura do cliente é obrigatória", "error");
    return false;
  }

  if (!state.assinaturas.tecnico) {
    showNotification("Assinatura do técnico é obrigatória", "error");
    return false;
  }

  return true;
}

// ======== IndexdDB ========
const FIELD_ID_MAP = {
  cliente: "cliente",
  cidade: "cidade",
  equipamento: "equipamento",
  equipamentoOutro: "equipamento-outro",
  tecnico: "tecnico",
  servico: "servico",
  dataInicial: "data-inicial",
  horaInicial: "hora-inicial",
  dataFinal: "data-final",
  horaFinal: "hora-final",
  veiculo: "veiculo",
  estoque: "estoque",
  numeroSerie: "numero-serie",
  relatorioMaquina: "relatorio-maquina",
  clienteNome: "cliente-nome",
  tecnicoNome: "tecnico-nome",
};

// ======== Configuração IndexdDB ========
const DB_NAME = "FormulariosDB";
const DB_VERSION = 4;
const STORE_NAME = "formularios";

let dbPromise;

// ======== Configuração IndexdDB ========
function initDB() {
  if (dbPromise) return dbPromise;

  dbPromise = idb
    .openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        console.log(
          "Migrando banco de dados da versão",
          oldVersion,
          "para",
          DB_VERSION,
        );

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          console.log("Criando nova store:", STORE_NAME);
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
          });

          store.createIndex("cliente", "cliente", { unique: false });
          store.createIndex("servico", "servico", { unique: false });
          store.createIndex("sincronizado", "sincronizado", {
            unique: false,
          });
        } else {
          console.log("Store já existe:", STORE_NAME);

          const store = db
            .transaction(STORE_NAME, "readwrite")
            .objectStore(STORE_NAME);

          // ======== Migração V1 para V2 ========
          if (oldVersion < 2) {
            console.log(
              "Migrando para versão 2: adicionando campo sincronizado",
            );
            return store.getAll().then((forms) => {
              const updates = forms
                .map((form) => {
                  if (form.sincronizado === undefined) {
                    form.sincronizado = false;
                    return store.put(form);
                  }
                })
                .filter(Boolean);
              return Promise.all(updates);
            });
          }

          // ======== Migração V2 para V3 ========
          if (oldVersion < 3) {
            console.log("Migrando para versão 3: adicionando campo chaveUnica");
            return store.getAll().then((forms) => {
              const updates = forms
                .map((form) => {
                  if (form.chaveUnica === undefined) {
                    form.chaveUnica = generateUniqueKey();
                    return store.put(form);
                  }
                })
                .filter(Boolean);
              return Promise.all(updates);
            });
          }

          // ======== Migração V3 para V4 ========
          if (oldVersion < 4) {
            console.log("Migrando para versão 4: atualização estrutural");
            return Promise.resolve();
          }
        }
      },
    })
    .then((db) => {
      console.log("Banco de dados inicializado com sucesso");
      return db;
    })
    .catch((error) => {
      console.error("Erro ao inicializar banco de dados:", error);
      dbPromise = null;
      throw error;
    });

  return dbPromise;
}

// ======== Limpeza de registros antigos ========
async function limparRegistrosAntigos(db) {
  const twentyFourHours = 5 * 7 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - twentyFourHours;

  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    let cursor = await store.openCursor();
    while (cursor) {
      if (cursor.key < cutoff) {
        cursor.delete();
      }
      cursor = await cursor.continue();
    }
    await tx.done;
  } catch (e) {
    console.warn(
      "Erro ao tentar limpar registros antigos (pode ser inicialização):",
      e,
    );
  }
}

// ======== Persitência local de formulários ========
async function salvarFormularioLocal() {
  if (!validateForm()) return;

  const f = collectFormData();

  const db = await initDB();
  const idEdicao = state.formularioEmEdicaoId
    ? Number(state.formularioEmEdicaoId)
    : null;
  const registroExistente = idEdicao
    ? await db.get(STORE_NAME, idEdicao)
    : null;

  const id = registroExistente ? registroExistente.id : Date.now();
  const createdAt = registroExistente?.createdAt || new Date().toISOString();
  const chaveUnica = registroExistente?.chaveUnica || generateUniqueKey();

  // ======== Estrutura do registro offline ========
  const registro = {
    // Metadados
    id: id,
    createdAt,
    updatedAt: new Date().toISOString(),

    cliente: f.cliente,
    cidade: f.cidade,
    equipamento: f.equipamento === "OUTRO" ? f.equipamentoOutro : f.equipamento,
    tecnico: f.tecnico,
    servico: f.servico,

    dataInicial: f.dataInicial,
    horaInicial: f.horaInicial,
    dataFinal: f.dataFinal,
    horaFinal: f.horaFinal,

    veiculo: f.veiculo,
    estoque: f.estoque,
    numeroSerie: f.numeroSerie,

    relatorioMaquina: f.relatorioMaquina,

    fotos: state.fotos,
    assinaturas: state.assinaturas,
    clienteNome: f.clienteNome,
    tecnicoNome: f.tecnicoNome,

    materiais: state.materiais,

    sincronizado: false,
    syncedAt: null,
    serverId: registroExistente?.serverId || null,

    // Máquina de estados do pdf-processor (V6).
    // Se o formulário já foi enviado e não tem serverId novo, preserva como enviado.
    // Se tem serverId (re-save de formulário já sincronizado), volta para pendente_pdf
    // para que o pdf-processor reprocesse os PDFs com os dados atualizados.
    statusPDF: registroExistente?.serverId
      ? "pendente_pdf"
      : registroExistente?.statusPDF || null,

    // Campos legados preservados para compatibilidade com o pdf-processor V5 durante a migração
    pdfsEnviados: registroExistente?.serverId
      ? false
      : registroExistente?.pdfsEnviados || false,
    pdfsEnviadosAt: registroExistente?.serverId
      ? null
      : registroExistente?.pdfsEnviadosAt || null,
    pdfsPrecisamAtualizar: Boolean(registroExistente?.serverId),
    fichaWhatsapp: registroExistente?.serverId
      ? false
      : registroExistente?.fichaWhatsapp || false,
    relatorioWhatsapp: registroExistente?.serverId
      ? false
      : registroExistente?.relatorioWhatsapp || false,
    chaveUnica,
  };

  try {
    await db.put(STORE_NAME, registro);

    state.formularioEmEdicaoId = id;

    await updatePendingCount();

    if (navigator.onLine && !syncState.autoSyncBlocked) {
      setTimeout(() => attemptSync(), 1000);
    } else if (!syncState.autoSyncBlocked) {
      await registrarBackgroundSync();
    }

    showNotification(
      registroExistente
        ? "Formulário atualizado! Recarregando..."
        : "Formulário salvo! Recarregando...",
      "success",
    );

    setTimeout(() => window.location.reload(), 1500);
  } catch (e) {
    console.error("Erro ao salvar:", e);
    showNotification("Erro ao salvar formulário", "error");
  }
}

// ======== Renderização da seção de formulários salvos ========
async function renderFormulariosSalvos() {
  const containerId = "formularios-salvos";
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("section");
    container.id = containerId;
    container.className = "pe-card mt-12 mb-12";

    const main = document.querySelector("main");
    if (main) {
      main.appendChild(container);
    } else {
      console.error(
        "Elemento 'main' não encontrado. Não é possível renderizar a seção de salvos.",
      );
      return;
    }
  }

  container.innerHTML = `
    <div class="pe-card-header">
      <h2 class="text-base sm:text-lg font-semibold text-[#0F0E0D] flex items-center">
        <i class="fas fa-history text-[#1B4F8A] mr-2.5"></i> Formulários Salvos
      </h2>
      <span class="pe-badge pe-badge-neutral pe-mono font-medium">
        ${syncState.pendingCount} pendente(s)
      </span>
    </div>
    <div class="pe-card-body">
      <div id="lista-formularios" class="space-y-3"></div>
    </div>
  `;

  const lista = container.querySelector("#lista-formularios");

  try {
    const db = await initDB();

    await limparRegistrosAntigos(db);

    let registros = await db.getAll(STORE_NAME);

    registros.sort((a, b) => b.id - a.id);

    if (registros.length === 0) {
      lista.innerHTML = `<p class="text-gray-500 text-sm">Nenhum formulário salvo nas últimas 5 semanas.</p>`;
      return;
    }

    // ======== Renderização de itens ========
    registros.forEach((registro) => {
      const dataLegivel = new Date(registro.id).toLocaleString("pt-BR");

      const statusIcon = registro.sincronizado
        ? '<i class="fas fa-check-circle text-green-500" title="Sincronizado"></i>'
        : '<i class="fas fa-clock text-yellow-500" title="Pendente de sincronização"></i>';

      const item = document.createElement("div");
      item.className =
        "flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm";
      item.innerHTML = `
					<div class="flex items-center">
						${statusIcon}
						<div class="ml-2">
							<div class="font-medium text-gray-800">${registro.cliente || "—"}</div>
							<div class="text-sm text-gray-500">${registro.servico || "—"} • ${dataLegivel} • Nº de Série: ${registro.numeroSerie}</div>
						</div>
					</div>
					<div class="flex items-center space-x-2">
						<button class="pe-btn pe-btn-sm bg-[#16A34A] hover:bg-[#15803D] text-white border-0 shadow-2xs py-1 px-2.5 rounded-md flex items-center justify-center share-btn" data-id="${registro.id}" title="Compartilhar no WhatsApp">
							<i class="fab fa-whatsapp text-sm"></i>
						</button>
						<button class="pe-btn pe-btn-secondary pe-btn-sm border border-[#CBD5E1] hover:border-[#94A3B8] text-[#0F0E0D] font-medium py-1 px-2.5 rounded-md flex items-center gap-1.5 shadow-2xs edit-btn" data-id="${registro.id}">
							<i class="fas fa-edit text-xs"></i> Editar
						</button>
						<button class="pe-btn pe-btn-sm bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] hover:border-[#F87171] py-1 px-2.5 rounded-md flex items-center justify-center shadow-2xs delete-btn" data-id="${registro.id}" title="Excluir Formulário">
							<i class="fas fa-trash text-xs text-[#DC2626]"></i>
						</button>
					</div>
				`;
      lista.appendChild(item);
    });

    // ======== Delegação de eventos ========
    lista.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        carregarFormularioLocal(id);
      });
    });

    lista.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        removerFormularioLocal(id);
      });
    });

    lista.querySelectorAll(".share-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        compartilharFormulario(id);
      });
    });
  } catch (e) {
    console.error("Erro fatal ao renderizar formulários do IndexedDB:", e);
    lista.innerHTML = `<p class="text-red-500 text-sm">Erro ao carregar lista de formulários. (Verifique a console.)</p>`;
  }
}

// ======== Carregamento de formulário para edição ========
async function carregarFormularioLocal(id) {
  try {
    const db = await initDB();

    // Recuperação por chave primária
    const registro = await db.get(STORE_NAME, Number(id));

    if (!registro) {
      showNotification("Registro não encontrado", "error");
      return;
    }

    state.formularioEmEdicaoId = registro.id;

    const f = registro;

    for (const key in FIELD_ID_MAP) {
      const elId = FIELD_ID_MAP[key];
      const el = document.getElementById(elId);
      if (!el) continue;

      const val = f[key] !== undefined ? f[key] : "";

      if (
        el.tagName === "SELECT" ||
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA"
      ) {
        el.value = val;

        if (elId === "equipamento") {
          equipamentoOutro.classList.toggle("hidden", el.value !== "OUTRO");
        }
      }
    }

    // ======== Restauração do Formulário ========
    state.materiais = registro.materiais
      ? JSON.parse(JSON.stringify(registro.materiais))
      : [];
    renderMateriais();

    state.fotos = registro.fotos
      ? JSON.parse(JSON.stringify(registro.fotos))
      : [];
    renderPhotos();

    state.assinaturas = registro.assinaturas || {
      cliente: null,
      tecnico: null,
    };

    if (state.assinaturas.cliente) {
      drawDataUrlOnCanvas(state.assinaturas.cliente, canvasCliente, ctxCliente);
    } else {
      ctxCliente.clearRect(0, 0, canvasCliente.width, canvasCliente.height);
    }

    if (state.assinaturas.tecnico) {
      drawDataUrlOnCanvas(state.assinaturas.tecnico, canvasTecnico, ctxTecnico);
    } else {
      ctxTecnico.clearRect(0, 0, canvasTecnico.width, canvasTecnico.height);
    }

    showNotification("Formulário carregado para edição.", "info");
    saveDraftToStorage();

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    console.error("Erro ao carregar registro do IndexedDB:", e);
    showNotification("Erro ao carregar formulário.", "error");
  }
}

// ======== Remoção de formulário ========
async function removerFormularioLocal(id) {
  try {
    const db = await initDB();

    await db.delete(STORE_NAME, Number(id));

    showNotification("Formulário excluído.", "info");

    await renderFormulariosSalvos();
  } catch (e) {
    console.error("Erro ao remover do IndexedDB:", e);
    showNotification("Erro ao excluir formulário.", "error");
  }
}

// ======== Compartilhamento dos pdf's ========
async function compartilharFormulario(id) {
  try {
    const db = await initDB();
    let form = await db.get(STORE_NAME, Number(id));
    if (!form) {
      form = await db.get(STORE_NAME, id);
    }

    if (!form) {
      showNotification("Formulário não encontrado no navegador", "error");
      return;
    }

    const materiais = form.materiais || [];
    const fotos = form.fotos || [];
    const assinaturas = form.assinaturas || { cliente: null, tecnico: null };
    const idStr = form.serverId ? `${form.serverId}` : `${form.id}`;

    showNotification("Gerando relatórios para compartilhar...", "info");

    const fichaBlob = await gerarFichaPDFBase64(
      form,
      materiais,
      fotos,
      assinaturas,
      idStr,
    );

    const relatorioBlob = await gerarRelatorioPDFBase64(
      form,
      materiais,
      fotos,
      assinaturas,
      idStr,
    );

    const nomeFicha = `Ficha de Materiais (No ${idStr}).pdf`;
    const nomeRelatorio = `Relatorio de Servico (No ${idStr}).pdf`;

    const fichaFile = new File([fichaBlob], nomeFicha, {
      type: "application/pdf",
    });

    const relatorioFile = new File([relatorioBlob], nomeRelatorio, {
      type: "application/pdf",
    });

    const detalhes = [
      `Cliente: ${form.cliente || "-"}`,
      `Cidade: ${form.cidade || "-"}`,
      `Equipamento: ${form.equipamento || "-"}`,
      `Serviço: ${form.servico || "-"}`,
      `Técnico: ${form.tecnico || "-"}`,
      `Estoque: ${form.estoque || "-"}`,
    ].join("\n");

    const textoShare = `Relatório de Serviço e Ficha de Materiais (Nº ${idStr})\n\n${detalhes}`;

    if (
      navigator.canShare &&
      navigator.canShare({ files: [fichaFile, relatorioFile] })
    ) {
      await navigator.share({
        title: `Fichas do cliente ${form.cliente || "-"} (Nº ${idStr})`,
        text: textoShare,
        files: [fichaFile, relatorioFile],
      });
      showNotification("Compartilhado no WhatsApp com sucesso!", "success");
      return;
    }

    // Fallback para navegadores sem suporte a compartilhamento direto de arquivos
    const linkFicha = URL.createObjectURL(fichaBlob);
    const a1 = document.createElement("a");
    a1.href = linkFicha;
    a1.download = nomeFicha;
    document.body.appendChild(a1);
    a1.click();
    document.body.removeChild(a1);
    URL.revokeObjectURL(linkFicha);

    const linkRel = URL.createObjectURL(relatorioBlob);
    const a2 = document.createElement("a");
    a2.href = linkRel;
    a2.download = nomeRelatorio;
    document.body.appendChild(a2);
    a2.click();
    document.body.removeChild(a2);
    URL.revokeObjectURL(linkRel);

    const msgWA = encodeURIComponent(
      `${textoShare}\n\n(Os 2 arquivos PDF foram baixados no seu dispositivo para envio no WhatsApp)`
    );
    window.open(`https://api.whatsapp.com/send?text=${msgWA}`, "_blank");
  } catch (e) {
    if (e.name === "AbortError") return;
    console.error("Erro ao compartilhar:", e);
    showNotification("Erro ao compartilhar via WhatsApp", "error");
  }
}
window.compartilharFormulario = compartilharFormulario;

// ======== Helper: Renderização de assinaturas em canvas ========
function drawDataUrlOnCanvas(dataUrl, canvas, ctx) {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== canvas.clientWidth * ratio) {
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;

      ctx.scale(ratio, ratio);

      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000";
    }
    ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight);
  };
  img.src = dataUrl;
}

// ======== Ponto de inicialização da aplicação ========
async function startApp() {
  try {
    try {
      await initDB();
    } catch (dbError) {
      console.error("Erro crítico no banco de dados:", dbError);
      await recriarBancoDados();
    }

    initSync();

    await renderFormulariosSalvos();

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    setupEventListeners();
    setupSignatureCanvas(canvasCliente, ctxCliente, "cliente");
    setupSignatureCanvas(canvasTecnico, ctxTecnico, "tecnico");
    populateMaterialsDatalist();
    loadDraftFromStorage();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js?v=0143")
          .then((reg) => {
            console.log(
              "Service Worker registrado com sucesso. Scope:",
              reg.scope,
            );
          })
          .catch((error) => {
            console.error("Falha no registro do Service Worker:", error);
          });
      });
    }
  } catch (error) {
    console.error("Falha ao iniciar a aplicação:", error);
    showNotification(
      "Erro ao inicializar aplicação. Recarregue a página.",
      "error",
    );
  }
}

// ======== Estratégia de recuperação do banco de dados ========
async function recriarBancoDados() {
  try {
    console.log("Tentando recriar banco de dados...");
    if (dbPromise) {
      const db = await dbPromise;
      db.close();
      dbPromise = null;
    }

    await idb.deleteDB(DB_NAME);
    console.log("Banco antigo deletado");

    await initDB();
    console.log("Novo banco criado com sucesso");
  } catch (error) {
    console.error("Falha ao recriar banco de dados:", error);
    throw error;
  }
}

// ======== Evento bootstrap da aplicação ========
document.addEventListener("DOMContentLoaded", startApp);

// ======== Handler do botão de exportação ========
exportBtn.addEventListener("click", function (e) {
  // Persistência local imediata
  salvarFormularioLocal();
});

// ======== Pipeline de geração de pdf ========
async function gerarPDFsAutomaticamente(
  formData,
  materiais,
  fotos,
  assinaturas,
) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.warn("jsPDF ainda não carregado, adiando geração...");
    setTimeout(
      () => gerarPDFsAutomaticamente(formData, materiais, fotos, assinaturas),
      500,
    );
    return;
  }

  try {
    await gerarFichaPDFBase64(formData, materiais, fotos, assinaturas);

    await new Promise((resolve) => setTimeout(resolve, 500));

    await gerarRelatorioPDFBase64(formData, materiais, fotos, assinaturas);

    showNotification("PDFs baixados com sucesso!", "success");
  } catch (e) {
    console.error("Erro ao gerar PDFs:", e);
    showNotification("Erro ao gerar PDFs", "error");
  }
}

// ======== Utilitário de formatação de data ========
function formatDate(dateString) {
  if (!dateString) return "-";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

// ======== Gerador de pdf da ficha de manutenção ========
async function gerarFichaPDFBase64(
  formData,
  materiais,
  fotos,
  assinaturas,
  serverId = null,
) {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
    compression: "MEDIUM",
    putOnlyUsedFonts: true,
    floatPrecision: 2,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const tableStyles3Col = {
    styles: { fontSize: 8, cellPadding: 3, halign: "center" },
    headStyles: {
      fillColor: [0, 82, 163],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: (pageWidth - 16) / 3 },
      1: { cellWidth: (pageWidth - 16) / 3 },
      2: { cellWidth: (pageWidth - 16) / 3 },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  };

  const logo = await carregarImagem("../assets/img/Logo.png");
  let y = 20;

  doc.setFillColor(0, 82, 163);
  doc.rect(0, 0, pageWidth, 17, "F");

  if (serverId) {
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`ID: ${serverId}`, pageWidth - 10, 6, { align: "right" });
  }

  if (logo) doc.addImage(logo, "PNG", 10, 1.5, 30, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("FICHA DE MANUTENÇÃO", pageWidth / 2, 11, { align: "center" });
  y = 22;

  const tableStyles4Col = {
    styles: { fontSize: 8, cellPadding: 3, halign: "center" },
    headStyles: {
      fillColor: [0, 82, 163],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: (pageWidth - 16) / 4 },
      1: { cellWidth: (pageWidth - 16) / 4 },
      2: { cellWidth: (pageWidth - 16) / 4 },
      3: { cellWidth: (pageWidth - 16) / 4 },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  };

  const table1Data = [
    [
      formData.cliente || "-",
      formData.cidade || "-",
      formData.equipamento || "-",
      formData.numeroSerie || "-",
    ],
  ];

  doc.autoTable({
    startY: y,
    head: [["CLIENTE", "CIDADE", "EQUIPAMENTO", "Nº SÉRIE"]],
    body: table1Data,
    ...tableStyles4Col,
  });

  y = doc.lastAutoTable.finalY + 4;

  const tableSolicitanteData = [["", "", ""]];

  doc.autoTable({
    startY: y,
    head: [["NOME DO SOLICITANTE", "FONE", "E-MAIL"]],
    body: tableSolicitanteData,
    ...tableStyles3Col,
  });

  y = doc.lastAutoTable.finalY + 4;

  const table2Data = [
    [
      formData.tecnico || "-",
      formData.veiculo || "-",
      formData.estoque || "-",
      formData.dataInicial ? formatDate(formData.dataInicial) : "-",
    ],
  ];

  doc.autoTable({
    startY: y,
    head: [["TÉCNICO", "VEÍCULO", "ESTOQUE", "DATA"]],
    body: table2Data,
    ...tableStyles4Col,
  });

  y = doc.lastAutoTable.finalY + 8;

  doc.setTextColor(0, 82, 163);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MATERIAIS UTILIZADOS", 10, y);
  y += 6;

  const materialsData = [];
  if (materiais && materiais.length > 0) {
    materiais.forEach((material) => {
      materialsData.push([
        material.codigo || "",
        material.quantidade || "",
        material.descricao || "",
      ]);
    });
  } else {
    materialsData.push(["", "", "Nenhum material utilizado."]);
  }

  doc.autoTable({
    startY: y,
    head: [["CÓDIGO", "QNTD", "MATERIAIS"]],
    body: materialsData,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: {
      fillColor: [0, 82, 163],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 25, halign: "center" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: pageWidth - 16 - 45, halign: "left" },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 8;

  doc.setTextColor(0, 82, 163);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ORDEM DE SERVIÇO", 10, y);
  y += 6;

  const table3Data = [
    [formData.osComplementar || "", formData.osServico || ""],
  ];

  doc.autoTable({
    startY: y,
    head: [["OS COMPLEMENTAR", "OS SERVIÇO"]],
    body: table3Data,
    styles: { fontSize: 8, cellPadding: 3, halign: "center" },
    headStyles: {
      fillColor: [0, 82, 163],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: (pageWidth - 16) / 2 },
      1: { cellWidth: (pageWidth - 16) / 2 },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 15;

  // ======== CORREÇÃO: Verificação de espaço antes das assinaturas ========
  const signatureBlockHeight = 42;
  if (y + signatureBlockHeight > pageHeight) {
    doc.addPage();
    y = 20;
  }

  const signatureWidth = 50;
  const signatureHeight = 25;
  const spacing = (pageWidth - signatureWidth * 2) / 3;

  if (assinaturas && assinaturas.tecnico) {
    try {
      doc.addImage(
        assinaturas.tecnico,
        "PNG",
        spacing,
        y,
        signatureWidth,
        signatureHeight,
      );
    } catch (e) {
      console.error("Erro ao adicionar assinatura do técnico:", e);
    }
  }

  if (assinaturas && assinaturas.cliente) {
    try {
      doc.addImage(
        assinaturas.cliente,
        "PNG",
        spacing * 2 + signatureWidth,
        y,
        signatureWidth,
        signatureHeight,
      );
    } catch (e) {
      console.error("Erro ao adicionar assinatura do cliente:", e);
    }
  }

  y += signatureHeight + 2;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(spacing, y, spacing + signatureWidth, y);
  doc.line(
    spacing * 2 + signatureWidth,
    y,
    spacing * 2 + signatureWidth * 2,
    y,
  );

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    formData.tecnicoNome || "TÉCNICO",
    spacing + signatureWidth / 2,
    y + 3,
    { align: "center" },
  );
  doc.text(
    formData.clienteNome || "CLIENTE",
    spacing * 2 + signatureWidth + signatureWidth / 2,
    y + 3,
    { align: "center" },
  );

  return doc.output("blob");
}

// ======== Gerador de pdf do relatório de serviço ========
async function gerarRelatorioPDFBase64(
  formData,
  materiais,
  fotos,
  assinaturas,
  serverId = null,
) {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
    compression: "MEDIUM",
    putOnlyUsedFonts: true,
    floatPrecision: 2,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logo = await carregarImagem("../assets/img/Logo.png");
  let y = 20;

  doc.setFillColor(0, 82, 163);
  doc.rect(0, 0, pageWidth, 17, "F");

  if (serverId) {
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`ID: ${serverId}`, pageWidth - 10, 6, { align: "right" });
  }

  if (logo) doc.addImage(logo, "PNG", 10, 1.5, 30, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE PRESTAÇÃO DE SERVIÇO", pageWidth / 2, 11, {
    align: "center",
  });
  y = 22;

  const tableStyles3Col = {
    styles: { fontSize: 8, cellPadding: 3, halign: "center" },
    headStyles: {
      fillColor: [0, 82, 163],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: (pageWidth - 16) / 3, halign: "center" },
      1: { cellWidth: (pageWidth - 16) / 3, halign: "center" },
      2: { cellWidth: (pageWidth - 16) / 3, halign: "center" },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  };

  const table1Data = [
    [
      formData.cliente || "-",
      formData.cidade || "-",
      formData.equipamento || "-",
    ],
  ];

  doc.autoTable({
    startY: y,
    head: [["CLIENTE", "CIDADE", "EQUIPAMENTO"]],
    body: table1Data,
    ...tableStyles3Col,
  });

  y = doc.lastAutoTable.finalY + 4;

  const table2Data = [
    [
      formData.tecnico || "-",
      formData.dataInicial ? formatDate(formData.dataInicial) : "-",
      formData.dataFinal ? formatDate(formData.dataFinal) : "-",
    ],
  ];

  doc.autoTable({
    startY: y,
    head: [["TÉCNICO", "DATA INICIAL", "DATA FINAL"]],
    body: table2Data,
    ...tableStyles3Col,
  });

  y = doc.lastAutoTable.finalY + 4;

  const table3Data = [
    [
      formData.servico || "-",
      formData.horaInicial || "-",
      formData.horaFinal || "-",
    ],
  ];

  doc.autoTable({
    startY: y,
    head: [["SERVIÇO", "HORÁRIO INICIAL", "HORÁRIO FINAL"]],
    body: table3Data,
    ...tableStyles3Col,
  });

  y = doc.lastAutoTable.finalY + 8;

  doc.setTextColor(0, 82, 163);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DA MÁQUINA", 10, y);
  y += 6;

  const relatorio = formData.relatorioMaquina || "Nenhum relatório preenchido.";

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const margin = 10;
  const textWidth = pageWidth - margin * 2;
  const lineHeight = 4.5;

  const lines = doc.splitTextToSize(relatorio, textWidth);
  const textHeight = lines.length * lineHeight;

  if (y + textHeight + 30 > pageHeight) {
    doc.addPage();
    y = 20;
    doc.setTextColor(0, 82, 163);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO DA MÁQUINA", 10, y);
    y += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
  }

  doc.setFillColor(245, 248, 251);
  doc.setDrawColor(208, 218, 230);
  doc.roundedRect(margin - 2, y - 2, textWidth + 4, textHeight + 4, 2, 2, "FD");

  doc.text(lines, margin, y + 2);
  y += textHeight + 10;

  if (fotos && fotos.length > 0) {
    if (y + 50 > pageHeight) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(0, 82, 163);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FOTOS DO SERVIÇO", 10, y);
    y += 6;

    const numFotos = fotos.length;
    let imgWidth, imgHeight, imgsPerRow;

    if (numFotos === 1) {
      imgWidth = 80;
      imgHeight = 60;
      imgsPerRow = 1;
    } else if (numFotos === 2) {
      imgWidth = 65;
      imgHeight = 50;
      imgsPerRow = 2;
    } else if (numFotos === 3) {
      imgWidth = 50;
      imgHeight = 40;
      imgsPerRow = 3;
    } else if (numFotos <= 4) {
      imgWidth = 45;
      imgHeight = 35;
      imgsPerRow = 4;
    } else if (numFotos <= 6) {
      imgWidth = 45;
      imgHeight = 35;
      imgsPerRow = 3;
    } else {
      imgWidth = 40;
      imgHeight = 30;
      imgsPerRow = 4;
    }

    const spacing = (pageWidth - 16 - imgWidth * imgsPerRow) / (imgsPerRow + 1);
    let currentX = 8 + spacing;
    let currentY = y;
    let photoCount = 0;

    for (let i = 0; i < numFotos; i++) {
      if (photoCount > 0 && photoCount % imgsPerRow === 0) {
        currentY += imgHeight + 6;

        if (currentY + imgHeight > pageHeight - 15) {
          doc.addPage();
          currentY = 20;
        }

        currentX = 8 + spacing;
      }

      try {
        const compressedImage = await compressImage(fotos[i].data, 1400, 0.65);

        doc.addImage(
          compressedImage,
          "JPEG",
          currentX,
          currentY,
          imgWidth,
          imgHeight,
        );
      } catch (e) {
        console.error("Erro ao adicionar imagem comprimida:", e);
      }

      currentX += imgWidth + spacing;
      photoCount++;
    }

    y = currentY + imgHeight + 8;
  }

  if (y + 35 > pageHeight) {
    doc.addPage();
    y = 20;
  }

  const signatureWidth = 50;
  const signatureHeight = 25;
  const spacing = (pageWidth - signatureWidth * 2) / 3;

  if (assinaturas && assinaturas.tecnico) {
    try {
      doc.addImage(
        assinaturas.tecnico,
        "PNG",
        spacing,
        y,
        signatureWidth,
        signatureHeight,
      );
    } catch (e) {
      console.error("Erro ao adicionar assinatura do técnico:", e);
    }
  }

  if (assinaturas && assinaturas.cliente) {
    try {
      doc.addImage(
        assinaturas.cliente,
        "PNG",
        spacing * 2 + signatureWidth,
        y,
        signatureWidth,
        signatureHeight,
      );
    } catch (e) {
      console.error("Erro ao adicionar assinatura do cliente:", e);
    }
  }

  y += signatureHeight + 2;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(spacing, y, spacing + signatureWidth, y);
  doc.line(
    spacing * 2 + signatureWidth,
    y,
    spacing * 2 + signatureWidth * 2,
    y,
  );

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    formData.tecnicoNome || "TÉCNICO",
    spacing + signatureWidth / 2,
    y + 3,
    { align: "center" },
  );
  doc.text(
    formData.clienteNome || "CLIENTE",
    spacing * 2 + signatureWidth + signatureWidth / 2,
    y + 3,
    { align: "center" },
  );

  return doc.output("blob");
}

// ======== Função auxiliar para carregar imagem ========
function carregarImagem(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ======== Integração no fluxo de exportação ========
function exportData() {
  if (!validateForm()) return;

  const formData = collectFormData();

  const dataToExport = {
    formData: formData,
    fotos: state.fotos,
    materiais: state.materiais,
    assinaturas: state.assinaturas,
    exportTimestamp: new Date().toISOString(),
    version: "1.0",
  };

  const dataStr = JSON.stringify(dataToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;

  const cliente = formData.cliente.replace(/[^a-zA-Z0-9]/g, "_");
  const data = new Date().toISOString().split("T")[0];
  link.download = `servico_${cliente}_${data}.json`;

  document.body.appendChild(link);
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showNotification("Dados exportados com sucesso!", "success");
}

function showNotification(message, type) {
  notification.className = `notification ${type}`;
  notificationIcon.className =
    type === "success"
      ? "fas fa-check-circle"
      : type === "error"
        ? "fas fa-exclamation-circle"
        : "fas fa-info-circle";
  notificationText.textContent = message;

  notification.style.display = "flex";

  setTimeout(() => {
    notification.style.display = "none";
  }, 5000);
}

// ======== Inicialização do sistema de integração ========
function initSync() {
  console.log("🚀 Inicializando sistema de sincronização...");

  syncBtn = document.getElementById("sync-btn");
  syncBadge = document.getElementById("sync-badge");
  syncIcon = syncBtn.querySelector("i");
  toggleAutoSyncBtn = document.getElementById("toggle-auto-sync-btn");
  toggleAutoSyncText = document.getElementById("toggle-auto-sync-text");

  if (!toggleAutoSyncBtn) {
    console.error("❌ Botão toggle-auto-sync-btn não encontrado!");
  } else {
    console.log("✅ Botão de toggle encontrado");
  }

  loadAutoSyncPreference();
  updateAutoSyncToggleUI();

  startSyncInterval();

  updatePendingCount();

  window.addEventListener("online", handleOnlineStatus);
  window.addEventListener("offline", handleOfflineStatus);

  console.log("✅ Sistema de sincronização iniciado");
}

// ======== Gerenciamento do estado online/offline ========
function handleOnlineStatus() {
  if (syncState.autoSyncBlocked) {
    showNotification("Conexão restaurada - modo manual ativo", "info");
    return;
  }

  showNotification("Conexão restaurada - Sincronizando...", "success");
  startSyncInterval();
  attemptSync();
}

function handleOfflineStatus() {
  showNotification("Sem conexão - Sincronização pausada", "error");
  stopSyncInterval();
  updateSyncButtonState(false);
}

// ======== Controle do intervalo de sincronização ========
function startSyncInterval() {
  if (!navigator.onLine || syncState.autoSyncBlocked) return;

  stopSyncInterval();

  syncState.syncInterval = setInterval(() => {
    if (navigator.onLine && !syncState.isSyncing) {
      attemptSync();
    }
  }, SYNC_CONFIG.interval);
}

function stopSyncInterval() {
  if (syncState.syncInterval) {
    clearInterval(syncState.syncInterval);
    syncState.syncInterval = null;
  }
}

function loadAutoSyncPreference() {
  const storedValue = localStorage.getItem(AUTO_SYNC_STORAGE_KEY);

  if (storedValue === null) {
    syncState.autoSyncBlocked = false;
    localStorage.setItem(AUTO_SYNC_STORAGE_KEY, "false");
    console.log("✅ Sincronização automática ATIVA (primeira vez)");
  } else {
    syncState.autoSyncBlocked = storedValue === "true";
    console.log(
      `📋 Preferência carregada: Sync Auto ${syncState.autoSyncBlocked ? "BLOQUEADA" : "ATIVA"}`,
    );
  }
}

function updateAutoSyncToggleUI() {
  if (!toggleAutoSyncBtn || !toggleAutoSyncText) {
    console.warn("⚠️ Elementos do botão de toggle não encontrados");
    return;
  }

  if (syncState.autoSyncBlocked) {
    toggleAutoSyncText.textContent = "Sync: Bloqueado";
    toggleAutoSyncBtn.classList.remove("pe-btn-secondary", "btn-secondary");
    toggleAutoSyncBtn.classList.add("pe-btn-danger", "bg-[#DC2626]", "text-white");
    toggleAutoSyncBtn.setAttribute("aria-pressed", "true");
    toggleAutoSyncBtn.title = "Clique para ATIVAR a sincronização automática";
    console.log("🔴 UI: Mostrando como BLOQUEADA");
  } else {
    toggleAutoSyncText.textContent = "Sync: Ativo";
    toggleAutoSyncBtn.classList.add("pe-btn-secondary");
    toggleAutoSyncBtn.classList.remove(
      "pe-btn-danger",
      "bg-[#DC2626]",
      "text-white",
      "bg-red-100",
      "text-red-800",
      "border",
      "border-red-300",
    );
    toggleAutoSyncBtn.setAttribute("aria-pressed", "false");
    toggleAutoSyncBtn.title = "Clique para BLOQUEAR a sincronização automática";
    console.log("🟢 UI: Mostrando como ATIVA");
  }
}

function toggleAutoSyncMode() {
  syncState.autoSyncBlocked = !syncState.autoSyncBlocked;
  localStorage.setItem(
    AUTO_SYNC_STORAGE_KEY,
    String(syncState.autoSyncBlocked),
  );
  console.log(
    `🔄 Toggle: Sync Auto agora está ${syncState.autoSyncBlocked ? "BLOQUEADA" : "ATIVA"}`,
  );
  updateAutoSyncToggleUI();

  if (syncState.autoSyncBlocked) {
    stopSyncInterval();
    showNotification(
      'Sincronização automática bloqueada. Use "Sincronizar" manualmente.',
      "info",
    );
    return;
  }

  startSyncInterval();
  showNotification("Sincronização automática reativada.", "success");
  if (navigator.onLine) {
    attemptSync();
  }
}

// ======== Sincronização manual ========
async function manualSync() {
  // Validação de pré-condições
  if (!navigator.onLine) {
    showNotification("Sem conexão para sincronizar", "error");
    return;
  }

  if (syncState.isSyncing) {
    showNotification("Sincronização já em andamento", "info");
    return;
  }

  showNotification("Iniciando sincronização manual...", "info");
  await attemptSync(true);
}

// ======== Sincronização automática ========
async function attemptSync(isManual = false) {
  if (syncState.isSyncing) return;

  try {
    syncState.isSyncing = true;
    updateSyncButtonState(true);

    const pendingForms = await getPendingForms();

    if (pendingForms.length === 0) {
      if (isManual) {
        showNotification("Nenhum formulário pendente para sincronizar", "info");
      }
      return;
    }

    if (isManual) {
      showNotification(
        `Sincronizando ${pendingForms.length} formulário(s)...`,
        "info",
      );
    }

    let successCount = 0;
    let errorCount = 0;

    for (const form of pendingForms) {
      try {
        const result = await syncSingleForm(form);
        if (result.success) {
          successCount++;

          await markFormAsSynced(form.id, result.serverId);

          // Rate limiting entre requisições
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Erro ao sincronizar formulário ${form.id}:`, error);
        errorCount++;
      }
    }

    await updatePendingCount();
    await renderFormulariosSalvos();

    if (isManual || successCount > 0) {
      const message =
        successCount > 0
          ? `${successCount} formulário(s) sincronizado(s) com sucesso${errorCount > 0 ? `, ${errorCount} falha(s)` : ""}`
          : "Falha na sincronização";

      showNotification(message, successCount > 0 ? "success" : "error");
    }
  } catch (error) {
    console.error("Erro geral na sincronização:", error);
    if (isManual) {
      showNotification("Erro na sincronização", "error");
    }
  } finally {
    syncState.isSyncing = false;
    updateSyncButtonState(false);
  }
}

// ======== Sincronização individual de formulário ========
async function syncSingleForm(form) {
  try {
    console.log("📤 Enviando formulário:", form.id);

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

    const payloadSize = JSON.stringify(payload).length;
    const payloadSizeMB = (payloadSize / 1024 / 1024).toFixed(2);

    console.log(`📦 Tamanho: ${payloadSizeMB}MB`);

    if (payloadSize > 50 * 1024 * 1024) {
      throw new Error(`Payload muito grande: ${payloadSizeMB}MB`);
    }

    const response = await fetch(SYNC_CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const serverId = data.insertId || data.id || data.existingId || null;

    console.log("✅ Sincronizado:", form.id, "serverId:", serverId);

    return {
      success: true,
      serverId: serverId,
    };
  } catch (error) {
    console.error("❌ Erro:", error);
    return {
      success: false,
      serverId: null,
    };
  }
}

// ======== Camada de acesso a dados pendentes ========
async function getPendingForms() {
  try {
    const db = await initDB();
    const allForms = await db.getAll(STORE_NAME);

    const cutoffTime = Date.now() - SYNC_CONFIG.maxRetention;
    const pendingForms = allForms.filter(
      (form) => !form.sincronizado && form.id > cutoffTime,
    );

    return pendingForms;
  } catch (error) {
    console.error("Erro ao buscar formulários pendentes:", error);
    return [];
  }
}

// ======== Operação atômica de atualização de estado ========
async function markFormAsSynced(formId, serverId = null) {
  try {
    const db = await initDB();
    const form = await db.get(STORE_NAME, formId);

    if (form) {
      form.sincronizado = true;
      form.syncedAt = new Date().toISOString();

      if (serverId) {
        form.serverId = serverId;
        console.log(`💾 serverId ${serverId} salvo para formulário ${formId}`);
      }
      // Sinaliza ao pdf-processor que este formulário precisa ter os PDFs enviados.
      // Só seta se ainda não foi enviado — evita resetar um formulário já concluído.
      if (form.statusPDF !== "enviado") {
        form.statusPDF = "pendente_pdf";
      }

      await db.put(STORE_NAME, form);
    }
  } catch (error) {
    console.error("Erro ao marcar formulário como sincronizado:", error);
  }
}

// ======== Atualização de contador de pendências ========
async function updatePendingCount() {
  try {
    const pendingForms = await getPendingForms();
    syncState.pendingCount = pendingForms.length;
    updateSyncBadge();
  } catch (error) {
    console.error("Erro ao atualizar contagem pendente:", error);
  }
}

// ======== Controller de badge visual ========
function updateSyncBadge() {
  if (syncState.pendingCount > 0) {
    syncBadge.textContent = syncState.pendingCount;
    syncBadge.classList.remove("hidden");
  } else {
    syncBadge.classList.add("hidden");
  }
}

// ======== Gerenciamento de estado do botão de sincronização ========
function updateSyncButtonState(syncing) {
  if (syncing) {
    syncIcon.classList.add("fa-spin");
    syncBtn.disabled = true;
    syncBtn.classList.add("opacity-50", "cursor-not-allowed");
  } else {
    syncIcon.classList.remove("fa-spin");
    syncBtn.disabled = false;
    syncBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }
}
