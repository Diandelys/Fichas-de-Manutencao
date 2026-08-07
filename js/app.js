// ======== PONTO DE ENTRADA UNIFICADO DA APLICAÇÃO (BOOTSTRAP) ========
import { initStorage, saveFormulario, getFormulario, getAllFormularios, deleteFormulario, purgeLocalTestRecords } from "./modules/storage.js";
import { runSingleFlightSync } from "./modules/sync.js";
import { initUIControls, collectFormData, validateForm, showNotification, carregarFormularioParaEdicao, state } from "./modules/ui.js";
import { SYNC_CONFIG } from "./modules/config.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Antigravity App Bootstrapping...");

  try {
    // 1. Inicializar Banco de Dados
    await initStorage();
    await purgeLocalTestRecords();
    console.log("✅ IndexedDB pronto.");

    // 2. Inicializar Controles de Interface
    initUIControls();

    // 3. Renderizar Formulários Salvos
    await renderFormulariosSalvosUI();

    // 4. Configurar Botões de Sincronização e Salvamento
    setupSyncAndActionButtons();

    // 5. Registrar Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js?v=0143")
        .then((reg) => console.log("✅ SW registrado:", reg.scope))
        .catch((err) => console.warn("⚠️ Falha ao registrar SW:", err));

      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "TRIGGER_SYNC") {
          console.log("📢 Notificação do SW recebida: executando sync...");
          runSingleFlightSync(false);
        }
      });
    }

    // 6. Ciclo de Sync Automático
    setInterval(() => {
      runSingleFlightSync(false);
    }, SYNC_CONFIG.INTERVAL);

    // Primeira tentativa de sync se online
    if (navigator.onLine) {
      runSingleFlightSync(false);
    }

  } catch (err) {
    console.error("❌ Erro durante inicialização da aplicação:", err);
    showNotification("Erro ao inicializar aplicação. Recarregue a página.", "error");
  }
});

/**
 * Configuração dos Botões Principais de Ação
 */
function setupSyncAndActionButtons() {
  const exportBtn = document.getElementById("export-btn");
  exportBtn?.addEventListener("click", async () => {
    if (!validateForm()) return;

    try {
      const data = collectFormData();
      const saved = await saveFormulario(data, state.formularioEmEdicaoId);

      showNotification("Formulário salvo com sucesso!", "success");
      await renderFormulariosSalvosUI();

      // Dispara sincronização em segundo plano
      runSingleFlightSync(false);

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e) {
      console.error("Erro ao salvar formulário:", e);
      showNotification("Erro ao salvar formulário localmente", "error");
    }
  });

  const syncBtn = document.getElementById("sync-btn");
  syncBtn?.addEventListener("click", async () => {
    try {
      showNotification("Iniciando sincronização...", "info");
      await runSingleFlightSync(true);
      showNotification("Sincronização concluída!", "success");
      await renderFormulariosSalvosUI();
    } catch (e) {
      showNotification(`Falha na sincronização: ${e.message}`, "error");
    }
  });
}

/**
 * Renderiza a lista de formulários salvos no IndexedDB
 */
let currentPageSalvos = 1;
const ITEMS_PER_PAGE = 5;

async function renderFormulariosSalvosUI() {
  const containerId = "formularios-salvos";
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("section");
    container.id = containerId;
    container.className = "pe-card mt-12 mb-12";
    const main = document.querySelector("main");
    if (main) main.appendChild(container);
    else return;
  }

  const registros = await getAllFormularios();
  const totalItems = registros.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  if (currentPageSalvos > totalPages) {
    currentPageSalvos = totalPages;
  }

  const pendentes = registros.filter((r) => !r.sincronizado).length;

  container.innerHTML = `
    <div class="pe-card-header">
      <h2 class="text-base sm:text-lg font-semibold text-[#0F0E0D] flex items-center">
        <i class="fas fa-history text-[#1B4F8A] mr-2.5"></i> Formulários Salvos
      </h2>
      <span class="pe-badge pe-badge-neutral pe-mono font-medium">
        ${pendentes} pendente(s)
      </span>
    </div>
    <div class="pe-card-body">
      <div id="lista-formularios" class="space-y-3"></div>
    </div>
    <div id="paginacao-formularios" class="pe-card-footer flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6965]"></div>
  `;

  const lista = container.querySelector("#lista-formularios");
  const paginacao = container.querySelector("#paginacao-formularios");

  if (totalItems === 0) {
    lista.innerHTML = `<p class="text-gray-500 text-sm">Nenhum formulário salvo recentemente.</p>`;
    paginacao.style.display = "none";
    return;
  }

  const startIndex = (currentPageSalvos - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const itemsPagina = registros.slice(startIndex, endIndex);

  itemsPagina.forEach((reg) => {
    const dataLegivel = new Date(reg.id).toLocaleString("pt-BR");
    const borderClass = reg.sincronizado
      ? "border-l-4 border-l-[#16A34A]"
      : "border-l-4 border-l-[#EAB308]";

    const item = document.createElement("div");
    item.className = `bg-white p-3.5 rounded-lg shadow-2xs border border-[#E5E7EB] ${borderClass} space-y-2.5`;
    item.innerHTML = `
      <!-- Linha 1: Cliente (Nº de Série) -->
      <div class="font-semibold text-[#0F0E0D] text-sm sm:text-base leading-snug">
        ${reg.cliente || "—"} <span class="text-xs sm:text-sm font-normal text-[#6B6965]">(Nº de Série: ${reg.numeroSerie || reg.equipamento || "—"})</span>
      </div>

      <!-- Linha 2: Serviço, data e hora, ID -->
      <div class="text-xs text-[#6B6965] pe-mono">
        ${reg.servico || "—"} • ${dataLegivel} • ID: ${reg.serverId || "Pendente"}
      </div>

      <!-- Linha 3: Botões Centralizados -->
      <div class="flex items-center justify-center space-x-2 pt-2 border-t border-[#F3F4F6]">
        <button class="pe-btn pe-btn-sm bg-[#16A34A] hover:bg-[#15803D] text-white border-0 shadow-2xs py-1 px-3 rounded-md flex items-center justify-center gap-1.5 share-btn" data-id="${reg.id}" title="Compartilhar no WhatsApp">
          <i class="fab fa-whatsapp text-sm"></i>
          <span class="text-xs font-medium">Compartilhar</span>
        </button>
        <button class="pe-btn pe-btn-secondary pe-btn-sm border border-[#CBD5E1] hover:border-[#94A3B8] text-[#0F0E0D] font-medium py-1 px-3 rounded-md flex items-center justify-center gap-1.5 shadow-2xs edit-btn" data-id="${reg.id}">
          <i class="fas fa-edit text-xs"></i>
          <span class="text-xs">Editar</span>
        </button>
        <button class="pe-btn pe-btn-sm bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] hover:border-[#F87171] py-1 px-2.5 rounded-md flex items-center justify-center shadow-2xs delete-btn" data-id="${reg.id}" title="Excluir Formulário">
          <i class="fas fa-trash text-xs text-[#DC2626]"></i>
        </button>
      </div>
    `;

    item.querySelector(".share-btn")?.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      await compartilharFormularioLocal(id);
    });

    item.querySelector(".edit-btn")?.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      carregarFormularioParaEdicao(id);
    });

    item.querySelector(".delete-btn")?.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      await deleteFormulario(id);
      showNotification("Formulário excluído", "info");
      await renderFormulariosSalvosUI();
    });

    lista.appendChild(item);
  });

  renderPaginacaoControlUI(paginacao, totalItems, startIndex, endIndex, currentPageSalvos, totalPages, (newPage) => {
    currentPageSalvos = newPage;
    renderFormulariosSalvosUI();
  });
}

function renderPaginacaoControlUI(container, totalItems, startIndex, endIndex, currentPage, totalPages, onPageChange) {
  if (!container) return;

  const infoText = `Mostrando <span class="font-medium text-[#0F0E0D] pe-mono">${startIndex + 1}–${endIndex}</span> de <span class="font-medium text-[#0F0E0D] pe-mono">${totalItems}</span> formulário(s)`;

  let buttonsHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage
      ? "bg-[#1B4F8A] text-white font-semibold shadow-2xs"
      : "bg-transparent text-[#0F0E0D] hover:bg-[#E5E7EB]";
    buttonsHTML += `<button class="w-8 h-8 rounded-md flex items-center justify-center text-xs transition-colors page-num-btn ${activeClass}" data-page="${i}">${i}</button>`;
  }

  container.innerHTML = `
    <div>${infoText}</div>
    <nav aria-label="Paginação de formulários" class="flex items-center space-x-1">
      <button id="page-prev-btn" class="w-8 h-8 rounded-md flex items-center justify-center text-[#6B6965] hover:bg-[#E5E7EB] hover:text-[#0F0E0D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors" ${currentPage === 1 ? "disabled" : ""}>
        <i class="fas fa-chevron-left text-xs"></i>
      </button>
      <div class="hidden sm:flex items-center space-x-1">
        ${buttonsHTML}
      </div>
      <span class="sm:hidden text-xs text-[#6B6965] px-2 pe-mono">Página ${currentPage} de ${totalPages}</span>
      <button id="page-next-btn" class="w-8 h-8 rounded-md flex items-center justify-center text-[#6B6965] hover:bg-[#E5E7EB] hover:text-[#0F0E0D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors" ${currentPage === totalPages ? "disabled" : ""}>
        <i class="fas fa-chevron-right text-xs"></i>
      </button>
    </nav>
  `;

  container.querySelector("#page-prev-btn")?.addEventListener("click", () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  });

  container.querySelector("#page-next-btn")?.addEventListener("click", () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  });

  container.querySelectorAll(".page-num-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const page = Number(e.currentTarget.dataset.page);
      if (page && page !== currentPage) onPageChange(page);
    });
  });
}

export async function compartilharFormularioLocal(id) {
  try {
    const reg = await getFormulario(Number(id));
    if (!reg) {
      showNotification("Formulário não encontrado no navegador", "error");
      return;
    }

    showNotification("Gerando relatórios em PDF para compartilhar...", "info");

    const idStr = reg.serverId ? `${reg.serverId}` : `${reg.id}`;

    const fichaBlob = await gerarFichaPDF(reg, reg.serverId);
    const relatorioBlob = await gerarRelatorioPDF(reg, reg.serverId);

    const nomeFicha = `Ficha de Materiais (No ${idStr}).pdf`;
    const nomeRelatorio = `Relatorio de Servico (No ${idStr}).pdf`;

    const fichaFile = new File([fichaBlob], nomeFicha, {
      type: "application/pdf",
    });

    const relatorioFile = new File([relatorioBlob], nomeRelatorio, {
      type: "application/pdf",
    });

    const detalhes = [
      `Cliente: ${reg.cliente || "-"}`,
      `Cidade: ${reg.cidade || "-"}`,
      `Equipamento: ${reg.equipamento || "-"}`,
      `Serviço: ${reg.servico || "-"}`,
      `Técnico: ${reg.tecnico || "-"}`,
      `Estoque: ${reg.estoque || "-"}`,
    ].join("\n");

    const textoShare = `Relatório de Serviço e Ficha de Materiais (Nº ${idStr})\n\n${detalhes}`;

    if (navigator.canShare && navigator.canShare({ files: [fichaFile, relatorioFile] })) {
      await navigator.share({
        title: `Fichas do cliente ${reg.cliente || "-"} (Nº ${idStr})`,
        text: textoShare,
        files: [fichaFile, relatorioFile],
      });
      showNotification("Compartilhado no WhatsApp com sucesso!", "success");
      return;
    }

    // Fallback para download dos 2 arquivos PDF no dispositivo e abertura do WhatsApp
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
    console.error("Erro ao compartilhar formulário local:", e);
    showNotification("Erro ao compartilhar via WhatsApp", "error");
  }
}

window.compartilharFormulario = compartilharFormularioLocal;
