// ======== CONTROLADOR DE INTERFACE DO USUÁRIO E FORMULÁRIOS (UI CONTROLLER) ========
import { estoqueData } from "./data.js";
import { saveFormulario, getFormulario, getAllFormularios, deleteFormulario } from "./storage.js";
import { gerarFichaPDF, gerarRelatorioPDF } from "./pdf.js";
import { SYNC_CONFIG } from "./config.js";

export let state = {
  fotos: [],
  materiais: [],
  formularioEmEdicaoId: null,
  assinaturas: {
    cliente: null,
    tecnico: null,
  },
};

let draftSaveTimeout = null;

export function initUIControls() {
  populateMaterialsDatalist();
  setupSignatureCanvas("cliente");
  setupSignatureCanvas("tecnico");
  setupFormEventListeners();
  setupPhotoEventListeners();
  setupMaterialEventListeners();
  setupModalEventListeners();
  updateOnlineStatus();
  initAutoSyncToggle();
  loadDraftFromStorage();

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
}

/**
 * Atualiza o indicador visual de conexão (Online / Offline)
 */
export function updateOnlineStatus() {
  const indicator = document.getElementById("status-indicator");
  const text = document.getElementById("status-text");
  if (!indicator || !text) return;

  if (navigator.onLine) {
    indicator.className = "status-indicator status-online";
    text.textContent = "Online";
  } else {
    indicator.className = "status-indicator status-offline";
    text.textContent = "Offline";
  }
}

/**
 * Inicializa e gerencia a alternância do botão Auto Sync
 */
export function initAutoSyncToggle() {
  const btn = document.getElementById("toggle-auto-sync-btn");
  const text = document.getElementById("toggle-auto-sync-text");
  if (!btn || !text) return;

  function updateUI() {
    const isBlocked = localStorage.getItem(SYNC_CONFIG.STORAGE_KEY_AUTO_SYNC) === "true";
    if (isBlocked) {
      text.textContent = "Sync: Bloqueado";
      btn.classList.remove("pe-btn-secondary", "btn-secondary");
      btn.classList.add("pe-btn-danger", "bg-[#DC2626]", "text-white");
      btn.setAttribute("aria-pressed", "true");
      btn.title = "Clique para ATIVAR a sincronização automática";
    } else {
      text.textContent = "Sync: Ativo";
      btn.classList.add("pe-btn-secondary");
      btn.classList.remove("pe-btn-danger", "bg-[#DC2626]", "text-white", "bg-red-100", "text-red-800", "border", "border-red-300");
      btn.setAttribute("aria-pressed", "false");
      btn.title = "Clique para BLOQUEAR a sincronização automática";
    }
  }

  btn.addEventListener("click", () => {
    const currentlyBlocked = localStorage.getItem(SYNC_CONFIG.STORAGE_KEY_AUTO_SYNC) === "true";
    const nextBlocked = !currentlyBlocked;
    localStorage.setItem(SYNC_CONFIG.STORAGE_KEY_AUTO_SYNC, String(nextBlocked));
    updateUI();
    showNotification(
      nextBlocked
        ? "Sincronização automática bloqueada."
        : "Sincronização automática reativada.",
      "info"
    );
  });

  updateUI();
}

/**
 * Preenche a datalist de materiais com base em estoqueData
 */
export function populateMaterialsDatalist() {
  const datalist = document.getElementById("materiais-list");
  if (!datalist) return;
  datalist.innerHTML = "";

  estoqueData.forEach((item) => {
    const option = document.createElement("option");
    option.value = `${item.codigo} – ${item.material}`;
    datalist.appendChild(option);
  });
}

/**
 * Event Listeners de Materiais
 */
function setupMaterialEventListeners() {
  const addBtn = document.getElementById("add-material-btn");
  const input = document.getElementById("material-input");

  addBtn?.addEventListener("click", addMaterial);
  input?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMaterial();
    }
  });
}

/**
 * Adiciona um material à lista
 */
export function addMaterial() {
  const materialInput = document.getElementById("material-input");
  const materialQtd = document.getElementById("material-qtd");

  const material = materialInput?.value.trim();
  const qtd = materialQtd?.value.trim();

  if (!material || !qtd || Number(qtd) <= 0) {
    showNotification("Preencha o material e uma quantidade válida", "error");
    return;
  }

  let codigo = "";
  let descricao = material;

  if (material.includes(" – ")) {
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

  if (materialInput) materialInput.value = "";
  if (materialQtd) materialQtd.value = "";

  renderMateriais();
  scheduleDraftSave();
  showNotification("Material adicionado com sucesso!", "success");
}

/**
 * Renderiza a lista de materiais utilizados
 */
export function renderMateriais() {
  const lista = document.getElementById("materiais-lista");
  if (!lista) return;
  lista.innerHTML = "";

  state.materiais.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200";

    itemEl.innerHTML = `
      <div>
        <span class="font-medium text-gray-800">${item.descricao}</span>
        ${item.codigo ? `<span class="text-sm text-gray-500 ml-2">(${item.codigo})</span>` : ""}
        <span class="text-blue-600 font-semibold ml-2">- ${item.quantidade} un.</span>
      </div>
      <button class="delete-material-btn text-red-500 hover:text-red-700 transition" data-index="${index}">
        <i class="fas fa-trash"></i>
      </button>
    `;

    lista.appendChild(itemEl);
  });

  lista.querySelectorAll(".delete-material-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      state.materiais.splice(idx, 1);
      renderMateriais();
      scheduleDraftSave();
      showNotification("Material removido", "info");
    });
  });
}

/**
 * Event Listeners de Fotos
 */
function setupPhotoEventListeners() {
  const addFotosBtn = document.getElementById("add-fotos-btn");
  const fotosInput = document.getElementById("fotos-input");

  addFotosBtn?.addEventListener("click", () => fotosInput?.click());
  fotosInput?.addEventListener("change", handleFileSelect);
}

/**
 * Processa a seleção de arquivos de imagem
 */
async function handleFileSelect(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  if (state.fotos.length + files.length > 10) {
    showNotification("Máximo de 10 fotos permitidas", "error");
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.match("image.*")) {
      showNotification("Apenas imagens são permitidas", "error");
      continue;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        showNotification("Otimizando imagem...", "info");
        const compressed = await compressImage(evt.target.result, 900, 0.65);
        state.fotos.push({
          name: file.name,
          type: "image/jpeg",
          data: compressed,
          timestamp: new Date().toISOString(),
        });
        renderPhotos();
        scheduleDraftSave();
        showNotification("Foto adicionada!", "success");
      } catch (err) {
        console.error("Erro ao otimizar imagem:", err);
        showNotification("Erro ao processar imagem", "error");
      }
    };
    reader.readAsDataURL(file);
  }

  e.target.value = "";
}

/**
 * Comprime imagem em Canvas
 */
function compressImage(base64, maxWidth = 900, quality = 0.65) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      const ratio = img.width / img.height;
      if (img.width > maxWidth) {
        cv.width = maxWidth;
        cv.height = maxWidth / ratio;
      } else {
        cv.width = img.width;
        cv.height = img.height;
      }
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL("image/jpeg", quality));
    };
    img.src = base64;
  });
}

/**
 * Renderiza a galeria de fotos
 */
export function renderPhotos() {
  const container = document.getElementById("fotos-preview");
  if (!container) return;
  container.innerHTML = "";

  state.fotos.forEach((foto, index) => {
    const item = document.createElement("div");
    item.className = "relative group";
    item.innerHTML = `
      <img src="${foto.data}" class="photo-preview cursor-pointer rounded-lg border border-gray-200">
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button class="view-photo-btn p-2 bg-white rounded-full shadow text-gray-800 mr-1" data-index="${index}">
          <i class="fas fa-eye"></i>
        </button>
        <button class="delete-photo-btn p-2 bg-white rounded-full shadow text-red-600" data-index="${index}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    container.appendChild(item);

    item.querySelector(".view-photo-btn")?.addEventListener("click", () => {
      const modal = document.getElementById("image-modal");
      const modalImg = document.getElementById("modal-image");
      if (modal && modalImg) {
        modalImg.src = foto.data;
        modal.style.display = "flex";
      }
    });

    item.querySelector(".delete-photo-btn")?.addEventListener("click", () => {
      state.fotos.splice(index, 1);
      renderPhotos();
      scheduleDraftSave();
      showNotification("Foto removida", "info");
    });
  });
}

/**
 * Event Listeners para o Modal de Imagem
 */
function setupModalEventListeners() {
  const modal = document.getElementById("image-modal");
  const modalClose = document.querySelector(".modal-close");

  modalClose?.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

/**
 * Configuração dos Canvas de Assinatura
 */
export function setupSignatureCanvas(tipo) {
  const canvas = document.getElementById(`assinatura-${tipo}`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function start(e) {
    const isLocked = document.getElementById(`lock-${tipo}`)?.checked;
    if (isLocked) return;

    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
  }

  function draw(e) {
    if (!isDrawing) return;
    if (e.type === "touchmove") e.preventDefault();

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;
    state.assinaturas[tipo] = canvas.toDataURL();
    scheduleDraftSave();
  }

  function stop() {
    isDrawing = false;
  }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stop);
  canvas.addEventListener("mouseout", stop);

  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stop);

  document.getElementById(`limpar-${tipo}`)?.addEventListener("click", () => {
    const isLocked = document.getElementById(`lock-${tipo}`)?.checked;
    if (isLocked) {
      showNotification("Desmarque o bloqueio para limpar a assinatura", "warning");
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.assinaturas[tipo] = null;
    scheduleDraftSave();
    showNotification("Assinatura limpa", "info");
  });
}

/**
 * Coleta dados do formulário HTML
 */
export function collectFormData() {
  const eq = document.getElementById("equipamento")?.value || "";
  const eqOutro = document.getElementById("equipamento-outro")?.value || "";

  return {
    cliente: document.getElementById("cliente")?.value || "",
    cidade: document.getElementById("cidade")?.value || "",
    equipamento: eq === "OUTRO" ? eqOutro : eq,
    equipamentoOutro: eqOutro,
    tecnico: document.getElementById("tecnico")?.value || "",
    servico: document.getElementById("servico")?.value || "",
    dataInicial: document.getElementById("data-inicial")?.value || "",
    horaInicial: document.getElementById("hora-inicial")?.value || "",
    dataFinal: document.getElementById("data-final")?.value || "",
    horaFinal: document.getElementById("hora-final")?.value || "",
    veiculo: document.getElementById("veiculo")?.value || "",
    estoque: document.getElementById("estoque")?.value || "",
    numeroSerie: document.getElementById("numero-serie")?.value || "",
    relatorioMaquina: document.getElementById("relatorio-maquina")?.value || "",
    clienteNome: document.getElementById("cliente-nome")?.value || "",
    tecnicoNome: document.getElementById("tecnico-nome")?.value || "",
    materiais: state.materiais,
    fotos: state.fotos,
    assinaturas: state.assinaturas,
  };
}

/**
 * Validação do Formulário
 */
export function validateForm() {
  const fields = [
    { id: "cliente", name: "Cliente" },
    { id: "cidade", name: "Cidade - UF" },
    { id: "equipamento", name: "Equipamento" },
    { id: "tecnico", name: "Técnico" },
    { id: "servico", name: "Serviço Prestado" },
    { id: "data-inicial", name: "Data Inicial" },
    { id: "hora-inicial", name: "Hora Inicial" },
    { id: "data-final", name: "Data Final" },
    { id: "hora-final", name: "Hora Final" },
    { id: "relatorio-maquina", name: "Relatório da Máquina" },
    { id: "cliente-nome", name: "Nome do Cliente" },
    { id: "tecnico-nome", name: "Nome do Técnico" },
  ];

  for (const item of fields) {
    const el = document.getElementById(item.id);
    if (!el || !el.value.trim()) {
      showNotification(`Preencha o campo obrigatório: ${item.name}`, "error");
      el?.focus();
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

/**
 * Notificações visuais
 */
export function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  const notificationIcon = document.getElementById("notification-icon");
  const notificationText = document.getElementById("notification-text");
  if (!notification || !notificationText) return;

  notification.className = `notification ${type}`;
  if (notificationIcon) {
    notificationIcon.className =
      type === "success"
        ? "fas fa-check-circle mr-2"
        : type === "error"
        ? "fas fa-exclamation-circle mr-2"
        : "fas fa-info-circle mr-2";
  }

  notificationText.textContent = message;
  notification.style.display = "flex";

  setTimeout(() => {
    notification.style.display = "none";
  }, 4000);
}

/**
 * Agendador de Rascunho com Debounce
 */
export function scheduleDraftSave() {
  clearTimeout(draftSaveTimeout);
  draftSaveTimeout = setTimeout(() => {
    try {
      const draft = {
        formData: collectFormData(),
        materiais: state.materiais,
        fotos: state.fotos,
        assinaturas: state.assinaturas,
      };
      localStorage.setItem(SYNC_CONFIG.STORAGE_KEY_DRAFT, JSON.stringify(draft));
    } catch (e) {
      console.warn("Rascunho não salvo no LocalStorage:", e);
    }
  }, 400);
}

/**
 * Carrega o rascunho do LocalStorage
 */
export function loadDraftFromStorage() {
  const raw = localStorage.getItem(SYNC_CONFIG.STORAGE_KEY_DRAFT);
  if (!raw) return;

  try {
    const draft = JSON.parse(raw);
    const f = draft.formData || {};

    const map = {
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

    for (const key in map) {
      const el = document.getElementById(map[key]);
      if (el && f[key] !== undefined) {
        el.value = f[key];
        if (map[key] === "equipamento") {
          document.getElementById("equipamento-outro")?.classList.toggle("hidden", el.value !== "OUTRO");
        }
      }
    }

    state.materiais = Array.isArray(draft.materiais) ? draft.materiais : [];
    state.fotos = Array.isArray(draft.fotos) ? draft.fotos : [];
    state.assinaturas = draft.assinaturas || { cliente: null, tecnico: null };

    renderMateriais();
    renderPhotos();
  } catch (e) {
    console.warn("Erro ao carregar rascunho:", e);
  }
}

/**
 * Event Listeners gerais do Formulário
 */
function setupFormEventListeners() {
  const eqSelect = document.getElementById("equipamento");
  const eqOutro = document.getElementById("equipamento-outro");
  eqSelect?.addEventListener("change", function () {
    eqOutro?.classList.toggle("hidden", this.value !== "OUTRO");
  });

  const clearBtn = document.getElementById("clear-form-btn");
  clearBtn?.addEventListener("click", () => {
    state.materiais = [];
    state.fotos = [];
    state.assinaturas = { cliente: null, tecnico: null };
    state.formularioEmEdicaoId = null;

    document.querySelectorAll("input, select, textarea").forEach((el) => {
      if (el.id !== "toggle-auto-sync-btn") el.value = "";
    });

    renderMateriais();
    renderPhotos();
    localStorage.removeItem(SYNC_CONFIG.STORAGE_KEY_DRAFT);
    showNotification("Formulário limpo", "info");
  });

  document.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", scheduleDraftSave);
    el.addEventListener("change", scheduleDraftSave);
  });
}

/**
 * Carrega um formulário salvo para edição na interface
 */
export async function carregarFormularioParaEdicao(id) {
  try {
    const reg = await getFormulario(Number(id));
    if (!reg) {
      showNotification("Registro não encontrado", "error");
      return;
    }

    state.formularioEmEdicaoId = reg.id;

    const map = {
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

    for (const key in map) {
      const el = document.getElementById(map[key]);
      if (el) {
        el.value = reg[key] !== undefined ? reg[key] : "";
        if (map[key] === "equipamento") {
          document.getElementById("equipamento-outro")?.classList.toggle("hidden", el.value !== "OUTRO");
        }
      }
    }

    state.materiais = Array.isArray(reg.materiais) ? [...reg.materiais] : [];
    state.fotos = Array.isArray(reg.fotos) ? [...reg.fotos] : [];
    state.assinaturas = reg.assinaturas || { cliente: null, tecnico: null };

    renderMateriais();
    renderPhotos();

    if (state.assinaturas.cliente) {
      drawDataUrlOnCanvas(state.assinaturas.cliente, "cliente");
    }
    if (state.assinaturas.tecnico) {
      drawDataUrlOnCanvas(state.assinaturas.tecnico, "tecnico");
    }

    showNotification("Formulário carregado para edição", "info");
    scheduleDraftSave();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Erro ao carregar para edição:", err);
    showNotification("Erro ao carregar formulário para edição", "error");
  }
}

/**
 * Desenha imagem DataURL em Canvas de Assinatura
 */
function drawDataUrlOnCanvas(dataUrl, tipo) {
  const canvas = document.getElementById(`assinatura-${tipo}`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = dataUrl;
}

