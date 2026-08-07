// ======== MOTOR ÚNICO E CENTRALIZADO DE GERAÇÃO DE PDFs ========
// Layout, cores, dimensões e tabelas preservadas com 100% de fidelidade visual.

import { LOGO_PATH } from "./config.js";

/**
 * Carrega a imagem da Logo como um objeto de imagem HTML
 */
function carregarLogo() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = LOGO_PATH;
  });
}

/**
 * Utilitário para comprimir imagem Base64 para JPEG no Canvas
 */
function compressImg(b64, maxW = 900, q = 0.65) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      const r = img.width / img.height;
      cv.width = img.width > maxW ? maxW : img.width;
      cv.height = img.width > maxW ? maxW / r : img.height;
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL("image/jpeg", q));
    };
    img.onerror = () => resolve(b64);
    img.src = b64;
  });
}

/**
 * Formata data no formato DD/MM/YYYY
 */
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const p = dateStr.split("-");
  if (p.length !== 3) return dateStr;
  return `${p[2]}/${p[1]}/${p[0]}`;
}

/**
 * Gera o cabeçalho padrão de 17mm em azul (#0052A3 / [0, 82, 163])
 */
function renderCabecalho(doc, titulo, serverId, logo) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(0, 82, 163);
  doc.rect(0, 0, pw, 17, "F");

  if (serverId) {
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`ID: ${serverId}`, pw - 10, 6, { align: "right" });
  }

  if (logo) {
    doc.addImage(logo, "PNG", 10, 1.5, 30, 15);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, pw / 2, 11, { align: "center" });
}

/**
 * Renderiza o bloco de assinaturas ao final do PDF
 */
function renderAssinaturas(doc, reg, y) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  if (y + 42 > ph) {
    doc.addPage();
    y = 20;
  }

  const sw = 50;
  const sh = 25;
  const sp = (pw - sw * 2) / 3;

  if (reg.assinaturas && reg.assinaturas.tecnico) {
    try {
      doc.addImage(reg.assinaturas.tecnico, "PNG", sp, y, sw, sh);
    } catch (e) {
      console.warn("Erro ao desenhar assinatura do técnico:", e);
    }
  }

  if (reg.assinaturas && reg.assinaturas.cliente) {
    try {
      doc.addImage(reg.assinaturas.cliente, "PNG", sp * 2 + sw, y, sw, sh);
    } catch (e) {
      console.warn("Erro ao desenhar assinatura do cliente:", e);
    }
  }

  y += sh + 2;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(sp, y, sp + sw, y);
  doc.line(sp * 2 + sw, y, sp * 2 + sw * 2, y);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    reg.tecnicoNome || reg.tecnico || "TÉCNICO",
    sp + sw / 2,
    y + 3,
    { align: "center" }
  );
  doc.text(
    reg.clienteNome || reg.cliente || "CLIENTE",
    sp * 2 + sw + sw / 2,
    y + 3,
    { align: "center" }
  );

  return y;
}

/**
 * =========================================================
 * 1. GERADOR DO PDF: FICHA DE MANUTENÇÃO
 * =========================================================
 */
export async function gerarFichaPDF(reg, serverId = null) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("jsPDF não carregado na página");
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pw = doc.internal.pageSize.getWidth();
  const logo = await carregarLogo();
  const sid = serverId || reg.serverId || null;

  renderCabecalho(doc, "FICHA DE MANUTENÇÃO", sid, logo);
  let y = 22;

  const t4Styles = {
    styles: { fontSize: 8, cellPadding: 3, halign: "center" },
    headStyles: {
      fillColor: [0, 82, 163],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: (pw - 16) / 4 },
      1: { cellWidth: (pw - 16) / 4 },
      2: { cellWidth: (pw - 16) / 4 },
      3: { cellWidth: (pw - 16) / 4 },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  };

  const t3Styles = {
    styles: { fontSize: 8, cellPadding: 3, halign: "center" },
    headStyles: {
      fillColor: [0, 82, 163],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: (pw - 16) / 3 },
      1: { cellWidth: (pw - 16) / 3 },
      2: { cellWidth: (pw - 16) / 3 },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  };

  // Tabela 1: Dados Principais
  doc.autoTable({
    startY: y,
    head: [["CLIENTE", "CIDADE", "EQUIPAMENTO", "Nº SÉRIE"]],
    body: [
      [
        reg.cliente || reg.clienteNome || "-",
        reg.cidade || "-",
        reg.equipamento || "-",
        reg.numeroSerie || "-",
      ],
    ],
    ...t4Styles,
  });
  y = doc.lastAutoTable.finalY + 4;

  // Tabela 2: Solicitante
  doc.autoTable({
    startY: y,
    head: [["NOME DO SOLICITANTE", "FONE", "E-MAIL"]],
    body: [["", "", ""]],
    ...t3Styles,
  });
  y = doc.lastAutoTable.finalY + 4;

  // Tabela 3: Técnico, Veículo, Estoque, Data
  doc.autoTable({
    startY: y,
    head: [["TÉCNICO", "VEÍCULO", "ESTOQUE", "DATA"]],
    body: [
      [
        reg.tecnico || "-",
        reg.veiculo || "-",
        reg.estoque || "-",
        formatDate(reg.dataInicial),
      ],
    ],
    ...t4Styles,
  });
  y = doc.lastAutoTable.finalY + 8;

  // Seção Materiais Utilizados
  doc.setTextColor(0, 82, 163);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MATERIAIS UTILIZADOS", 10, y);
  y += 6;

  const matRows =
    reg.materiais && reg.materiais.length
      ? reg.materiais.map((m) => [
          m.codigo || "",
          m.quantidade || "",
          m.descricao || "",
        ])
      : [["", "", "Nenhum material utilizado."]];

  doc.autoTable({
    startY: y,
    head: [["CÓDIGO", "QNTD", "MATERIAIS"]],
    body: matRows,
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
      2: { cellWidth: pw - 16 - 45, halign: "left" },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  });
  y = doc.lastAutoTable.finalY + 8;

  // Seção Ordem de Serviço
  doc.setTextColor(0, 82, 163);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ORDEM DE SERVIÇO", 10, y);
  y += 6;

  doc.autoTable({
    startY: y,
    head: [["OS COMPLEMENTAR", "OS SERVIÇO"]],
    body: [[reg.osComplementar || "", reg.osServico || ""]],
    styles: { fontSize: 8, cellPadding: 3, halign: "center" },
    headStyles: {
      fillColor: [0, 82, 163],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: (pw - 16) / 2 },
      1: { cellWidth: (pw - 16) / 2 },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  });
  y = doc.lastAutoTable.finalY + 15;

  renderAssinaturas(doc, reg, y);

  return doc.output("blob");
}

/**
 * =========================================================
 * 2. GERADOR DO PDF: RELATÓRIO DE PRESTAÇÃO DE SERVIÇO
 * =========================================================
 */
export async function gerarRelatorioPDF(reg, serverId = null) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("jsPDF não carregado na página");
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const logo = await carregarLogo();
  const sid = serverId || reg.serverId || null;

  renderCabecalho(doc, "RELATÓRIO DE PRESTAÇÃO DE SERVIÇO", sid, logo);
  let y = 22;

  const t3Styles = {
    styles: { fontSize: 8, cellPadding: 3, halign: "center" },
    headStyles: {
      fillColor: [0, 82, 163],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: (pw - 16) / 3 },
      1: { cellWidth: (pw - 16) / 3 },
      2: { cellWidth: (pw - 16) / 3 },
    },
    margin: { left: 8, right: 8 },
    theme: "grid",
  };

  doc.autoTable({
    startY: y,
    head: [["CLIENTE", "CIDADE", "EQUIPAMENTO"]],
    body: [
      [
        reg.cliente || reg.clienteNome || "-",
        reg.cidade || "-",
        reg.equipamento || "-",
      ],
    ],
    ...t3Styles,
  });
  y = doc.lastAutoTable.finalY + 4;

  doc.autoTable({
    startY: y,
    head: [["TÉCNICO", "DATA INICIAL", "DATA FINAL"]],
    body: [
      [
        reg.tecnico || "-",
        formatDate(reg.dataInicial),
        formatDate(reg.dataFinal),
      ],
    ],
    ...t3Styles,
  });
  y = doc.lastAutoTable.finalY + 4;

  doc.autoTable({
    startY: y,
    head: [["SERVIÇO", "HORÁRIO INICIAL", "HORÁRIO FINAL"]],
    body: [
      [
        reg.servico || "-",
        reg.horaInicial || "-",
        reg.horaFinal || "-",
      ],
    ],
    ...t3Styles,
  });
  y = doc.lastAutoTable.finalY + 8;

  // Relatório da Máquina
  doc.setTextColor(0, 82, 163);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DA MÁQUINA", 10, y);
  y += 6;

  const relTxt = reg.relatorioMaquina || "Nenhum relatório preenchido.";
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const lines = doc.splitTextToSize(relTxt, pw - 20);
  const th = lines.length * 4.5;

  if (y + th + 30 > ph) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(245, 248, 251);
  doc.setDrawColor(208, 218, 230);
  doc.roundedRect(8, y - 2, pw - 16, th + 4, 2, 2, "FD");
  doc.text(lines, 10, y + 2);
  y += th + 10;

  // Fotos do Serviço
  if (reg.fotos && reg.fotos.length > 0) {
    if (y + 50 > ph) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(0, 82, 163);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FOTOS DO SERVIÇO", 10, y);
    y += 6;

    const n = reg.fotos.length;
    let iw, ih, ipr;

    if (n === 1) { iw = 80; ih = 60; ipr = 1; }
    else if (n === 2) { iw = 65; ih = 50; ipr = 2; }
    else if (n === 3) { iw = 50; ih = 40; ipr = 3; }
    else if (n <= 4) { iw = 45; ih = 35; ipr = 4; }
    else if (n <= 6) { iw = 45; ih = 35; ipr = 3; }
    else { iw = 40; ih = 30; ipr = 4; }

    const sp2 = (pw - 16 - iw * ipr) / (ipr + 1);
    let cx = 8 + sp2;
    let cy = y;
    let pc = 0;

    for (let fi = 0; fi < n; fi++) {
      if (pc > 0 && pc % ipr === 0) {
        cy += ih + 6;
        if (cy + ih > ph - 15) {
          doc.addPage();
          cy = 20;
        }
        cx = 8 + sp2;
      }
      try {
        const comp = await compressImg(reg.fotos[fi].data, 1400, 0.65);
        doc.addImage(comp, "JPEG", cx, cy, iw, ih);
      } catch (e) {
        console.warn("Erro ao comprimir e incluir imagem:", e);
      }
      cx += iw + sp2;
      pc++;
    }
    y = cy + ih + 8;
  }

  renderAssinaturas(doc, reg, y);

  return doc.output("blob");
}

window.gerarFichaPDF = gerarFichaPDF;
window.gerarRelatorioPDF = gerarRelatorioPDF;
