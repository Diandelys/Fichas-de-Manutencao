// ======== PONTO DE ENTRADA UNIFICADO DA APLICAÇÃO (BOOTSTRAP) ========
import { initStorage, saveFormulario, getAllFormularios, deleteFormulario, purgeLocalTestRecords } from "./modules/storage.js";
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
      navigator.serviceWorker.register("./sw.js?v=0140")
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
    const statusIcon = reg.sincronizado
      ? '<i class="fas fa-check-circle text-green-500" title="Sincronizado na VPS"></i>'
      : '<i class="fas fa-clock text-yellow-500" title="Pendente de sincronização"></i>';

    const item = document.createElement("div");
    item.className = "flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100";
    item.innerHTML = `
      <div class="flex items-center">
        ${statusIcon}
        <div class="ml-3">
          <div class="font-medium text-gray-800">${reg.cliente || "—"} (${reg.equipamento || "—"})</div>
          <div class="text-xs text-gray-500">${reg.servico || "—"} • ${dataLegivel} • ID: ${reg.serverId || "Pendente"}</div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button class="btn-secondary px-3 py-1 text-xs rounded edit-btn" data-id="${reg.id}">
          <i class="fas fa-edit mr-1"></i> Editar
        </button>
        <button class="btn-secondary px-3 py-1 text-xs rounded delete-btn text-red-600" data-id="${reg.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

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
