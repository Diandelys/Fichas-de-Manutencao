// ======== CONFIGURAÇÕES GLOBAIS E CONSTANTES DO SISTEMA ========

export const VPS_ENDPOINTS = {
  SET: "https://vps.pesoexato.com/servico_set",
  LIST: "https://vps.pesoexato.com/servico_list",
};

export const SUPABASE_CONFIG = {
  URL: "https://sqiqmpgzjxjjztuzlewg.supabase.co",
  ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaXFtcGd6anhqanp0dXpsZXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDEzMzIsImV4cCI6MjA4NTE3NzMzMn0.o-IKqiSvBdUZoKiWHi2TzIBuXPG1jcL2JdUwedNM4y8",
  EDGE_FUNCTION_URL:
    "https://sqiqmpgzjxjjztuzlewg.supabase.co/functions/v1/enviar-documentos",
  BUCKET: "pdfs-temporarios",
};

export const DB_CONFIG = {
  NAME: "FormulariosDB",
  VERSION: 5,
  STORES: {
    FORMULARIOS: "formularios",
    BLOBS: "blobs_store",
  },
};

export const STATUS_PDF = {
  RASCUNHO: "rascunho",
  PENDENTE_VPS: "pendente_vps",
  PENDENTE_PDF: "pendente_pdf",
  PROCESSANDO: "processando",
  ENVIADO: "enviado",
  ERRO_DEFINITIVO: "erro_definitivo",
};

export const SYNC_CONFIG = {
  INTERVAL: 30000, // 30s
  MAX_RETENTION: 5 * 7 * 24 * 60 * 60 * 1000, // 5 semanas em ms
  MAX_TENTATIVAS: 5,
  STORAGE_KEY_AUTO_SYNC: "syncAutoBlocked",
  STORAGE_KEY_DRAFT: "formularioDraft",
};

export const LOGO_PATH = "Logo.png";
