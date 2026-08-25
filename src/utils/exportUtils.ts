import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { BookingRequest, TransactionRecord, ClientPerformanceReport, FinancialSummary } from '../types';

/**
 * Format currency to Brazilian Real (R$)
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format ISO date string to Brazilian short date (DD/MM/YYYY)
 */
export function formatDateBR(dateString: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

/**
 * Generate PDF for Financial Cash Flow Report (Fluxo de Caixa Mensal)
 */
export function exportFinancialsPDF(summary: FinancialSummary, transactions: TransactionRecord[]) {
  const doc = new jsPDF();

  // Title & Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDIO SOM DO UNIVERSO', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Financeiro & Fluxo de Caixa Mensal', 14, 27);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.text(`Data do Relatório: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 43);

  // Summary Cards
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 48, 55, 24, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('FATURAMENTO TOTAL', 18, 54);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // green
  doc.text(formatBRL(summary.totalRevenue), 18, 64);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(77, 48, 55, 24, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('A RECEBER (PENDENTE)', 81, 54);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12); // orange
  doc.text(formatBRL(summary.pendingRevenue), 81, 64);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(140, 48, 56, 24, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('SESSÕES CONFIRMADAS', 144, 54);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${summary.confirmedCount} sessões`, 144, 64);

  // Table of Transactions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Histórico de Transações e Pagamentos PIX', 14, 82);

  const tableRows = transactions.map((tx) => [
    formatDateBR(tx.confirmedAt),
    tx.clientName,
    tx.serviceName,
    tx.paymentMethod,
    tx.status.toUpperCase(),
    formatBRL(tx.amount),
  ]);

  autoTable(doc, {
    startY: 86,
    head: [['Data/Hora', 'Cliente / Artista', 'Serviço', 'Forma', 'Status', 'Valor (R$)']],
    body: tableRows,
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 86 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${i} de ${pageCount} - Studio Som do Universo - Sistema Integrado PIX`, 14, 285);
  }

  doc.save(`Fluxo_de_Caixa_Studio_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Generate Excel (.xlsx) file for Financial Cash Flow
 */
export function exportFinancialsExcel(transactions: TransactionRecord[], summary: FinancialSummary) {
  const txData = transactions.map((tx) => ({
    'ID Transação': tx.id,
    'Data de Confirmação': formatDateBR(tx.confirmedAt),
    'Cliente / Artista': tx.clientName,
    'Serviço Prestado': tx.serviceName,
    'Forma de Pagamento': tx.paymentMethod,
    'Status': tx.status,
    'Valor Pago (R$)': tx.amount,
  }));

  const summaryData = [
    { 'Métrica': 'Faturamento Total Confirmado', 'Valor': formatBRL(summary.totalRevenue) },
    { 'Métrica': 'Valores Pendentes a Receber', 'Valor': formatBRL(summary.pendingRevenue) },
    { 'Métrica': 'Quantidade de Transações', 'Valor': transactions.length },
    { 'Métrica': 'Ticket Médio por Sessão', 'Valor': formatBRL(summary.averageTicket) },
    { 'Métrica': 'Taxa de Ocupação Média Estúdio', 'Valor': `${summary.occupancyRatePercentage}%` },
  ];

  const workbook = XLSX.utils.book_new();
  
  const sheetTx = XLSX.utils.json_to_sheet(txData);
  const sheetSummary = XLSX.utils.json_to_sheet(summaryData);

  XLSX.utils.book_append_sheet(workbook, sheetTx, 'Transações PIX');
  XLSX.utils.book_append_sheet(workbook, sheetSummary, 'Resumo Geral');

  XLSX.writeFile(workbook, `Fluxo_Caixa_Studio_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Generate PDF for Client Performance Report (Relatório de Desempenho da Conta do Cliente)
 */
export function exportClientReportPDF(report: ClientPerformanceReport) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDIO SOM DO UNIVERSO', 14, 16);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Desempenho do Cliente / Conta', 14, 25);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);

  // Client Profile Summary Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 44, 182, 38, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(report.bandOrArtistName || report.clientName, 18, 53);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Responsável: ${report.clientName} | E-mail: ${report.email} | Tel: ${report.phone}`, 18, 60);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Investido: ${formatBRL(report.totalSpent)}`, 18, 70);
  doc.text(`Horas de Estúdio: ${report.totalHoursInStudio}h`, 100, 70);
  doc.text(`Total Sessões: ${report.totalSessionsCount}`, 155, 70);

  // Bookings History Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Histórico de Sessões e Agendamentos', 14, 91);

  const bookingRows = report.bookings.map((b) => [
    formatDateBR(b.preferredDate),
    b.serviceName,
    b.roomName,
    `${b.durationHours}h (${b.startTime})`,
    b.status.replace('_', ' ').toUpperCase(),
    formatBRL(b.finalAmount),
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Data', 'Serviço', 'Sala', 'Duração', 'Status', 'Valor (R$)']],
    body: bookingRows,
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Additional Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Métricas de Uso:', 14, finalY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`• Serviço mais utilizado: ${report.favoriteService || 'N/A'}`, 14, finalY + 18);
  doc.text(`• Sala com maior preferência: ${report.favoriteRoom || 'N/A'}`, 14, finalY + 24);
  doc.text(`• Primeira sessão gravada em: ${formatDateBR(report.firstSessionDate)}`, 14, finalY + 30);
  doc.text(`• Última atividade no estúdio: ${formatDateBR(report.lastSessionDate)}`, 14, finalY + 36);

  doc.save(`Relatorio_Cliente_${report.clientName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generate Excel (.xlsx) file for Client Performance Report
 */
export function exportClientReportExcel(report: ClientPerformanceReport) {
  const infoData = [
    { 'Campo': 'Nome / Banda', 'Valor': report.bandOrArtistName || report.clientName },
    { 'Campo': 'Responsável', 'Valor': report.clientName },
    { 'Campo': 'E-mail', 'Valor': report.email },
    { 'Campo': 'Telefone', 'Valor': report.phone },
    { 'Campo': 'Total Investido no Estúdio', 'Valor': formatBRL(report.totalSpent) },
    { 'Campo': 'Horas de Gravação / Produção', 'Valor': `${report.totalHoursInStudio} horas` },
    { 'Campo': 'Quantidade de Sessões', 'Valor': report.totalSessionsCount },
    { 'Campo': 'Serviço Favorito', 'Valor': report.favoriteService },
  ];

  const bookingsData = report.bookings.map((b) => ({
    'Código Agendamento': b.id,
    'Data Preferencial': formatDateBR(b.preferredDate),
    'Horário': b.startTime,
    'Serviço': b.serviceName,
    'Sala Reservada': b.roomName,
    'Duração (Horas)': b.durationHours,
    'Status': b.status,
    'Valor Total (R$)': b.finalAmount,
  }));

  const workbook = XLSX.utils.book_new();
  const sheetInfo = XLSX.utils.json_to_sheet(infoData);
  const sheetBookings = XLSX.utils.json_to_sheet(bookingsData);

  XLSX.utils.book_append_sheet(workbook, sheetInfo, 'Resumo do Cliente');
  XLSX.utils.book_append_sheet(workbook, sheetBookings, 'Histórico de Agendamentos');

  XLSX.writeFile(workbook, `Relatorio_Cliente_${report.clientName.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Generate PDF Formal Quote / Receipt
 */
export function exportReceiptPDF(booking: BookingRequest, studioInfo: any) {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(studioInfo.name, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`CNPJ: ${studioInfo.cnpj} | ${studioInfo.address}`, 14, 26);
  doc.text(`Contato: ${studioInfo.phone} | ${studioInfo.email}`, 14, 33);

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROVANTE DE AGENDAMENTO & PAGAMENTO PIX', 14, 52);

  doc.setLineWidth(0.5);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 56, 196, 56);

  // Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Código do Agendamento: ${booking.id}`, 14, 65);
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 140, 65);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 72, 182, 35, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE / ARTISTA', 18, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome / Projeto: ${booking.bandOrArtistName || booking.clientName}`, 18, 88);
  doc.text(`Responsável: ${booking.clientName}`, 18, 95);
  doc.text(`E-mail: ${booking.clientEmail} | Tel: ${booking.clientPhone}`, 18, 102);

  // Service Details
  autoTable(doc, {
    startY: 114,
    head: [['Descrição do Serviço', 'Sala', 'Data & Hora', 'Duração', 'Valor (R$)']],
    body: [[
      booking.serviceName,
      booking.roomName,
      `${formatDateBR(booking.preferredDate)} às ${booking.startTime}`,
      `${booking.durationHours}h`,
      formatBRL(booking.finalAmount),
    ]],
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, finalY + 10, 182, 28, 3, 3, 'F');

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ STATUS: PAGAMENTO PIX CONFIRMADO E HORÁRIO RESERVADO', 18, finalY + 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Apresente este comprovante na recepção do estúdio. Boa sessão de gravação!`, 18, finalY + 30);

  doc.save(`Comprovante_Agendamento_${booking.id}.pdf`);
}
