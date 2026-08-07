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
  `;

  const lista = container.querySelector("#lista-formularios");

  if (registros.length === 0) {
    lista.innerHTML = `<p class="text-gray-500 text-sm">Nenhum formulário salvo recentemente.</p>`;
    return;
  }

  registros.forEach((reg) => {
    const dataLegivel = new Date(reg.id).toLocaleString("pt-BR");
    const statusTag = reg.sincronizado
      ? '<span class="pe-badge pe-badge-success"><i class="fas fa-check-circle text-[10px]"></i> Sincronizado</span>'
      : '<span class="pe-badge pe-badge-warning"><i class="fas fa-clock text-[10px]"></i> Pendente</span>';

    const item = document.createElement("div");
    item.className = "bg-white p-3.5 rounded-lg shadow-2xs border border-[#E5E7EB] space-y-2.5";
    item.innerHTML = `
      <!-- Linha 1: Cliente (Nº de Série) + Tag de Status -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="font-semibold text-[#0F0E0D] text-sm sm:text-base leading-snug">
          ${reg.cliente || "—"} <span class="text-xs sm:text-sm font-normal text-[#6B6965]">(Nº de Série: ${reg.numeroSerie || reg.equipamento || "—"})</span>
        </div>
        ${statusTag}
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
