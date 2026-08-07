// ======== SERVICE WORKER (PWA & OFFLINE CACHE) ========
importScripts("https://cdn.jsdelivr.net/npm/idb@8/build/umd.js");

const CACHE_NAME = "formulario-cache-v0144";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./assets/icons/favicon.ico",
];

// ======== EVENTO DE INSTALAÇÃO ========
self.addEventListener("install", (event) => {
  console.log("🟢 SW: Instalando v0144...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch((err) =>
        console.warn("⚠️ Falha ao cachear assets essenciais:", err),
      )
      .then(() => self.skipWaiting()),
  );
});

// ======== EVENTO DE ATIVAÇÃO ========
self.addEventListener("activate", (event) => {
  console.log("🔵 SW: Ativando v0144...");
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map((name) => {
            if (name !== CACHE_NAME) {
              console.log("🗑️ Removendo cache antigo:", name);
              return caches.delete(name);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ======== ESTRATÉGIA DE CACHE / FETCH ========
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;

  // Requisições para VPS passam direto pela rede
  if (url.hostname === "vps.pesoexato.com") {
    event.respondWith(fetch(event.request));
    return;
  }

  // CDN assets (jsPDF, FontAwesome, Tailwind, IDB) usam Cache First
  const isCDN =
    url.hostname.includes("cdnjs") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("cdn.tailwindcss.com");

  if (isCDN) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cached) => cached || fetch(event.request)),
    );
    return;
  }

  // Assets locais usam Network First com fallback de cache
  if (url.hostname === location.hostname) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
            return new Response("Offline", { status: 503 });
          });
        }),
    );
    return;
  }
});

// ======== BACKGROUND SYNC ========
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-formularios") {
    console.log("🔄 SW: Background Sync disparado!");
    event.waitUntil(notificarJanelasOuSincronizar());
  }
});

/**
 * Notifica abas ativas para executar a sincronização single-flight
 */
async function notificarJanelasOuSincronizar() {
  const clients = await self.clients.matchAll({ type: "window" });
  if (clients.length > 0) {
    console.log("📢 SW: Notificando janela ativa para sincronizar.");
    clients[0].postMessage({ type: "TRIGGER_SYNC" });
  } else {
    console.log("ℹ️ SW: Nenhuma janela ativa. Processamento ocorrerá ao abrir a aplicação.");
  }
}
