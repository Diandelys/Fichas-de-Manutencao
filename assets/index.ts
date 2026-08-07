// ======== EDGE FUNCTION: enviar-documentos ========
// V4 — Suporte a Envio Direto de URLs (Upload Direto do PWA no Storage) + Fallback Base64

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "pdfs-temporarios";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      serverId,
      mensagemFicha,
      mensagemRelatorio,
      pdfFichaBase64,
      pdfRelatorioBase64,
      urlFicha: urlFichaDireta,
      urlRelatorio: urlRelatorioDireta,
    } = body;

    if (!serverId) {
      return Response.json(
        { error: "Campo obrigatório ausente: serverId" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    if (!pdfFichaBase64 && !pdfRelatorioBase64 && !urlFichaDireta && !urlRelatorioDireta) {
      return Response.json(
        {
          error:
            "Pelo menos um PDF (base64 ou URL) deve ser fornecido",
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const whatsappApiUrl = Deno.env.get("WHATSAPP_API_URL") || "https://api.leadfinder.com.br/integracao/enviarMensagem/6B2991B488/ARQUIVO";
    const whatsappToken = Deno.env.get("WHATSAPP_TOKEN") || "58103127083906988C16EAD628F241E78C350689710608F82A91D2D3C4D36757";
    const whatsappGroupId = Deno.env.get("WHATSAPP_GROUP_ID") || "120363021586402490-group";

    const resultado: {
      ok: boolean;
      fichaUpload: boolean;
      fichaWhatsapp: boolean;
      relatorioUpload: boolean;
      relatorioWhatsapp: boolean;
      urlFicha?: string;
      urlRelatorio?: string;
      erros: string[];
    } = {
      ok: false,
      fichaUpload: false,
      fichaWhatsapp: false,
      relatorioUpload: false,
      relatorioWhatsapp: false,
      erros: [],
    };

    // ======== PROCESSAR FICHA ========
    if (urlFichaDireta) {
      resultado.fichaUpload = true;
      resultado.urlFicha = urlFichaDireta;
      try {
        console.log(`📱 Enviando Ficha via URL direta (serverId: ${serverId})...`);
        await enviarWhatsApp(
          whatsappApiUrl,
          whatsappToken,
          whatsappGroupId,
          urlFichaDireta,
          mensagemFicha ?? `Ficha de Materiais (Nº ${serverId})`,
        );
        resultado.fichaWhatsapp = true;
        console.log("✅ Ficha enviada ao WhatsApp");
      } catch (errWA) {
        const msg = `WhatsApp ficha: ${errWA instanceof Error ? errWA.message : String(errWA)}`;
        console.error("❌", msg);
        resultado.erros.push(msg);
      }
    } else if (pdfFichaBase64) {
      const nomeFicha = `materiais_${serverId}.pdf`;
      try {
        console.log(`📤 Upload da Ficha via Base64 (serverId: ${serverId})...`);
        const fichaBytes = base64ToBytes(pdfFichaBase64);

        const { error: errUpload } = await supabase.storage
          .from(BUCKET)
          .upload(nomeFicha, fichaBytes, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (errUpload) throw new Error(`Upload ficha: ${errUpload.message}`);

        resultado.fichaUpload = true;
        const { data: urlFichaData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(nomeFicha);
        resultado.urlFicha = urlFichaData.publicUrl;
        console.log("✅ Ficha no storage");

        try {
          console.log("📱 Enviando Ficha ao WhatsApp...");
          await enviarWhatsApp(
            whatsappApiUrl,
            whatsappToken,
            whatsappGroupId,
            urlFichaData.publicUrl,
            mensagemFicha ?? `Ficha de Materiais (Nº ${serverId})`,
          );
          resultado.fichaWhatsapp = true;
          console.log("✅ Ficha enviada ao WhatsApp");
        } catch (errWA) {
          const msg = `WhatsApp ficha: ${errWA instanceof Error ? errWA.message : String(errWA)}`;
          console.error("❌", msg);
          resultado.erros.push(msg);
        }
      } catch (errUpload) {
        const msg = `Upload ficha: ${errUpload instanceof Error ? errUpload.message : String(errUpload)}`;
        console.error("❌", msg);
        resultado.erros.push(msg);
      }
    }

    // ======== PROCESSAR RELATÓRIO ========
    if (urlRelatorioDireta) {
      resultado.relatorioUpload = true;
      resultado.urlRelatorio = urlRelatorioDireta;
      try {
        console.log(`📱 Enviando Relatório via URL direta (serverId: ${serverId})...`);
        await enviarWhatsApp(
          whatsappApiUrl,
          whatsappToken,
          whatsappGroupId,
          urlRelatorioDireta,
          mensagemRelatorio ?? `Relatório de Serviço (Nº ${serverId})`,
        );
        resultado.relatorioWhatsapp = true;
        console.log("✅ Relatório enviado ao WhatsApp");
      } catch (errWA) {
        const msg = `WhatsApp relatório: ${errWA instanceof Error ? errWA.message : String(errWA)}`;
        console.error("❌", msg);
        resultado.erros.push(msg);
      }
    } else if (pdfRelatorioBase64) {
      const nomeRelatorio = `relatorio_${serverId}.pdf`;
      try {
        console.log(`📤 Upload do Relatório via Base64 (serverId: ${serverId})...`);
        const relatorioBytes = base64ToBytes(pdfRelatorioBase64);

        const { error: errUpload } = await supabase.storage
          .from(BUCKET)
          .upload(nomeRelatorio, relatorioBytes, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (errUpload)
          throw new Error(`Upload relatório: ${errUpload.message}`);

        resultado.relatorioUpload = true;
        const { data: urlRelatorioData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(nomeRelatorio);
        resultado.urlRelatorio = urlRelatorioData.publicUrl;
        console.log("✅ Relatório no storage");

        try {
          console.log("📱 Enviando Relatório ao WhatsApp...");
          await enviarWhatsApp(
            whatsappApiUrl,
            whatsappToken,
            whatsappGroupId,
            urlRelatorioData.publicUrl,
            mensagemRelatorio ?? `Relatório de Serviço (Nº ${serverId})`,
          );
          resultado.relatorioWhatsapp = true;
          console.log("✅ Relatório enviado ao WhatsApp");
        } catch (errWA) {
          const msg = `WhatsApp relatório: ${errWA instanceof Error ? errWA.message : String(errWA)}`;
          console.error("❌", msg);
          resultado.erros.push(msg);
        }
      } catch (errUpload) {
        const msg = `Upload relatório: ${errUpload instanceof Error ? errUpload.message : String(errUpload)}`;
        console.error("❌", msg);
        resultado.erros.push(msg);
      }
    }

    const fichaOk = (!urlFichaDireta && !pdfFichaBase64) || resultado.fichaWhatsapp;
    const relatorioOk = (!urlRelatorioDireta && !pdfRelatorioBase64) || resultado.relatorioWhatsapp;
    resultado.ok = fichaOk && relatorioOk;

    const statusHttp = resultado.ok ? 200 : 207;
    console.log(
      resultado.ok ? "✅ Tudo enviado com sucesso!" : "⚠️ Envio parcial:",
      resultado,
    );

    return Response.json(resultado, {
      status: statusHttp,
      headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error("❌ Erro inesperado na Edge Function:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});

async function enviarWhatsApp(
  apiUrl: string,
  token: string,
  groupId: string,
  urlArquivo: string,
  mensagem: string,
) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mensagem,
      arquivo: urlArquivo,
      destinatarios: [groupId],
    }),
  });

  if (!response.ok) {
    const texto = await response.text();
    throw new Error(`WhatsApp falhou (${response.status}): ${texto}`);
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const puro = base64.includes(",") ? base64.split(",")[1] : base64;
  const binario = atob(puro);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}
