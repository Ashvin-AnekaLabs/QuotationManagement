const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { formatDate } = require('../helpers/quotationHelper');

/**
 * Helper to fetch quickchart image buffer for PDF rendering
 */
async function fetchChartBuffer(chartConfig, width = 500, height = 260) {
  try {
    const url = `https://quickchart.io/chart?w=${width}&h=${height}&devicePixelRatio=2&bkg=white&c=${encodeURIComponent(
      JSON.stringify(chartConfig)
    )}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    return null;
  }
}

/**
 * Generate Excel Workbook Buffer for Reports & Analytics
 */
async function generateExcelReport(reportData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QuoteMaster';
  workbook.created = new Date();

  // 1. Overview Sheet
  const overviewSheet = workbook.addWorksheet('Overview Summary');
  overviewSheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 25 },
  ];

  overviewSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  overviewSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F46E5' },
  };

  const overview = reportData.overview || {};

  overviewSheet.addRows([
    { metric: 'Total Clients', value: overview.total_clients || 0 },
    { metric: 'Total Employees', value: overview.total_employees || 0 },
    { metric: 'Total Quotations', value: overview.total_quotations || 0 },
    { metric: 'Approved Quotations', value: overview.approved_quotations || 0 },
    { metric: 'Pending Quotations', value: overview.pending_quotations || 0 },
    { metric: 'Total Revenue', value: overview.total_revenue_formatted || '$0.00' },
  ]);

  // 2. Recent Quotations Sheet
  const recentSheet = workbook.addWorksheet('Recent Quotations');
  recentSheet.columns = [
    { header: 'Quotation ID', key: 'quotation_number', width: 22 },
    { header: 'Client Name', key: 'client', width: 32 },
    { header: 'Amount', key: 'amount_formatted', width: 20 },
    { header: 'Created Date', key: 'created_at', width: 26 },
  ];

  recentSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  recentSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F46E5' },
  };

  (reportData.recent_quotations || []).forEach((q) => {
    recentSheet.addRow({
      quotation_number: q.quotation_number,
      client: q.client,
      amount_formatted: q.amount_formatted,
      created_at: q.created_at ? formatDate(q.created_at) : '',
    });
  });

  // 3. Top Clients Sheet
  const topClientsSheet = workbook.addWorksheet('Top Clients');
  topClientsSheet.columns = [
    { header: 'Client Name', key: 'client', width: 35 },
    { header: 'Projects Count', key: 'projects', width: 18 },
    { header: 'Total Revenue', key: 'revenue_formatted', width: 22 },
  ];

  topClientsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  topClientsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F46E5' },
  };

  (reportData.top_clients || []).forEach((c) => {
    topClientsSheet.addRow({
      client: c.client,
      projects: c.projects,
      revenue_formatted: c.revenue_formatted,
    });
  });

  // 4. Employee Assignments Sheet
  const empSheet = workbook.addWorksheet('Employee Assignments');
  empSheet.columns = [
    { header: 'Employee Name', key: 'employee', width: 32 },
    { header: 'Role', key: 'role', width: 28 },
    { header: 'Active Projects', key: 'active_projects', width: 18 },
    { header: 'Total Assigned Hours', key: 'hours', width: 22 },
  ];

  empSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  empSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F46E5' },
  };

  (reportData.employee_assignments || []).forEach((e) => {
    empSheet.addRow({
      employee: e.employee_name || e.employee,
      role: e.role,
      active_projects: e.total_projects ?? e.active_projects ?? 0,
      hours: e.total_hours ?? e.hours ?? 0,
    });
  });

  return await workbook.xlsx.writeBuffer();
}

/**
 * Generate Modern Executive PDF Report Document
 */
async function generatePdfReport(reportData, filters = {}, res) {
  // Fetch Chart Buffers in Parallel
  const statusCounts = reportData.quotation_status || {};
  const monthlyQuots = reportData.monthly_quotations || [];
  const monthlyRevs = reportData.monthly_revenue || [];



  const barConfig = {
    type: 'bar',
    data: {
      labels: monthlyQuots.length > 0 ? monthlyQuots.map((m) => m.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Quotations Count',
          data: monthlyQuots.length > 0 ? monthlyQuots.map((m) => m.count) : [0, 0, 0, 0, 0, 0],
          backgroundColor: '#8B5CF6',
          borderRadius: 4,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Monthly Quotations', font: { size: 14, weight: 'bold' } },
      },
      scales: { y: { beginAtZero: true } },
    },
  };

  const lineConfig = {
    type: 'line',
    data: {
      labels: monthlyRevs.length > 0 ? monthlyRevs.map((m) => m.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue ($)',
          data: monthlyRevs.length > 0 ? monthlyRevs.map((m) => m.revenue) : [0, 0, 0, 0, 0, 0],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Monthly Revenue ($)', font: { size: 14, weight: 'bold' } },
      },
      scales: { y: { beginAtZero: true } },
    },
  };

  const [barBuffer, lineBuffer] = await Promise.all([
    fetchChartBuffer(barConfig, 523, 180),
    fetchChartBuffer(lineConfig, 523, 180),
  ]);

  // Create PDF Document
  const doc = new PDFDocument({ 
    margins: { top: 36, left: 36, right: 36, bottom: 10 }, 
    size: 'A4', 
    bufferPages: true 
  });
  doc.pipe(res);

  const primaryColor = '#4F46E5';
  const textColor = '#1E293B';
  const subtextColor = '#64748B';
  const borderColor = '#E2E8F0';

  // --- BRANDED HEADER BANNER ---
  doc
    .rect(36, 36, 523, 6)
    .fill(primaryColor);

  doc
    .fillColor(primaryColor)
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('QuoteMaster', 36, 52);

  doc
    .fillColor(textColor)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('Reports & Analytics Executive Summary', 36, 80);

  doc
    .fillColor(subtextColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`Comprehensive overview of business performance • Generated on ${new Date().toLocaleString()}`, 36, 100);

  // --- APPLIED FILTERS BOX ---
  const filterY = 118;
  doc
    .roundedRect(36, filterY, 523, 36, 6)
    .fillAndStroke('#F8FAFC', borderColor);

  const dateRangeStr =
    filters.fromDate || filters.startDate || filters.start_date
      ? `${filters.fromDate || filters.startDate || filters.start_date} to ${filters.toDate || filters.endDate || filters.end_date || 'Today'}`
      : 'All Time';

  doc.fillColor(subtextColor).fontSize(8).font('Helvetica-Bold');
  doc.text('APPLIED FILTERS:', 48, filterY + 12);
  doc.font('Helvetica').fillColor(textColor);
  doc.text(`Date Range: ${dateRangeStr}  |  Client: ${filters.clientId || filters.client_id || 'All Clients'}  |  Employee: ${filters.employeeId || filters.employee_id || 'All Employees'}`, 135, filterY + 12);

  let currentY = filterY + 54;

  // --- OVERVIEW SUMMARY METRIC CARDS (2 Rows x 3 Columns) ---
  doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text('Overview Metrics', 36, currentY);
  currentY += 22;

  const overview = reportData.overview || {};
  const cardWidth = 256;
  const cardHeight = 52;
  const gapX = 11;
  const gapY = 10;

  const cards = [
    { title: 'Total Clients', value: String(overview.total_clients || 0), bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8' },
    { title: 'Total Employees', value: String(overview.total_employees || 0), bg: '#F5F3FF', border: '#DDD6FE', color: '#6D28D9' },
    { title: 'Total Quotations', value: String(overview.total_quotations || 0), bg: '#EEF2FF', border: '#C7D2FE', color: '#4338CA' },
    { title: 'Total Revenue', value: overview.total_revenue_formatted || '$0.00', bg: '#F0FDF4', border: '#BBF7D0', color: '#15803D' },
  ];

  cards.forEach((card, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 36 + col * (cardWidth + gapX);
    const y = currentY + row * (cardHeight + gapY);

    doc
      .roundedRect(x, y, cardWidth, cardHeight, 6)
      .fillAndStroke(card.bg, card.border);

    doc.fillColor(subtextColor).fontSize(8).font('Helvetica-Bold').text(card.title.toUpperCase(), x + 12, y + 10);
    doc.fillColor(card.color).fontSize(14).font('Helvetica-Bold').text(card.value, x + 12, y + 26);
  });

  currentY += 2 * cardHeight + gapY + 25;

  // --- DASHBOARD CHARTS SECTION ---
  if (barBuffer || lineBuffer) {
    doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text('Analytics Charts', 36, currentY);
    currentY += 22;

    if (barBuffer) {
      doc.image(barBuffer, 36, currentY, { width: 523, height: 160 });
      currentY += 175;
    }

    if (lineBuffer) {
      doc.image(lineBuffer, 36, currentY, { width: 523, height: 160 });
      currentY += 175;
    }
  }

  // --- AUTO PAGE BREAK & RECENT QUOTATIONS TABLE ---
  if (currentY > 600) {
    doc.addPage();
    currentY = 40;
  }

  doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text('Recent Quotations', 36, currentY);
  currentY += 20;

  // Recent Quotations Table Header
  const renderTableHeader = (headers, startY, colWidths, startX = 36) => {
    doc.rect(startX, startY, 523, 22).fill(primaryColor);
    let xAcc = startX + 8;
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
    headers.forEach((h, idx) => {
      const align = idx === 2 ? 'right' : 'left';
      doc.text(h, xAcc, startY + 6, { width: colWidths[idx] - 10, align });
      xAcc += colWidths[idx];
    });
    return startY + 22;
  };

  const reqHeaders = ['QUOTATION ID', 'CLIENT NAME', 'AMOUNT', 'DATE'];
  const reqWidths = [120, 200, 100, 103];
  currentY = renderTableHeader(reqHeaders, currentY, reqWidths);

  // Render Rows
  (reportData.recent_quotations || []).forEach((q, index) => {
    if (currentY > 750) {
      doc.addPage();
      currentY = 40;
      currentY = renderTableHeader(reqHeaders, currentY, reqWidths);
    }

    const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    doc.rect(36, currentY, 523, 22).fillAndStroke(rowBg, borderColor);

    doc.fontSize(8).font('Helvetica').fillColor(textColor);
    let xAcc = 44;

    doc.text(q.quotation_number || '', xAcc, currentY + 6, { width: reqWidths[0] - 10 });
    xAcc += reqWidths[0];

    doc.text(q.client || '', xAcc, currentY + 6, { width: reqWidths[1] - 10 });
    xAcc += reqWidths[1];

    doc.font('Helvetica-Bold').text(q.amount_formatted || '$0.00', xAcc, currentY + 6, { width: reqWidths[2] - 10, align: 'right' });
    xAcc += reqWidths[2];

    const dtStr = q.created_at ? formatDate(q.created_at) : 'N/A';
    doc.fillColor(textColor).fontSize(8).font('Helvetica').text(dtStr, xAcc, currentY + 6, { width: reqWidths[3] - 10 });

    currentY += 22;
  });

  currentY += 25;

  // --- TOP CLIENTS & EMPLOYEE ASSIGNMENTS TABLES ---
  if (currentY > 600) {
    doc.addPage();
    currentY = 40;
  }

  doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text('Top Clients Performance', 36, currentY);
  currentY += 20;

  const clientHeaders = ['CLIENT NAME', 'PROJECTS COUNT', 'TOTAL REVENUE'];
  const clientWidths = [243, 140, 140];
  currentY = renderTableHeader(clientHeaders, currentY, clientWidths);

  (reportData.top_clients || []).forEach((c, index) => {
    if (currentY > 750) {
      doc.addPage();
      currentY = 40;
      currentY = renderTableHeader(clientHeaders, currentY, clientWidths);
    }

    const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    doc.rect(36, currentY, 523, 22).fillAndStroke(rowBg, borderColor);

    doc.fontSize(8).font('Helvetica').fillColor(textColor);
    doc.text(c.client || '', 44, currentY + 6, { width: clientWidths[0] - 10 });
    doc.text(String(c.projects || 0), 287, currentY + 6, { width: clientWidths[1] - 10 });
    doc.font('Helvetica-Bold').text(c.revenue_formatted || '$0.00', 427, currentY + 6, { width: clientWidths[2] - 10, align: 'right' });

    currentY += 22;
  });

  currentY += 25;

  if (currentY > 600) {
    doc.addPage();
    currentY = 40;
  }

  doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text('Employee Resource Assignments', 36, currentY);
  currentY += 20;

  const empHeaders = ['EMPLOYEE NAME', 'ROLE / DESIGNATION', 'ACTIVE PROJECTS', 'TOTAL HOURS'];
  const empWidths = [160, 163, 100, 100];
  currentY = renderTableHeader(empHeaders, currentY, empWidths);

  (reportData.employee_assignments || []).forEach((e, index) => {
    if (currentY > 750) {
      doc.addPage();
      currentY = 40;
      currentY = renderTableHeader(empHeaders, currentY, empWidths);
    }

    const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    doc.rect(36, currentY, 523, 22).fillAndStroke(rowBg, borderColor);

    doc.fontSize(8).font('Helvetica').fillColor(textColor);
    doc.text(e.employee_name || e.employee || '', 44, currentY + 6, { width: empWidths[0] - 10 });
    doc.text(e.role || '', 204, currentY + 6, { width: empWidths[1] - 10 });
    doc.text(String(e.total_projects ?? e.active_projects ?? 0), 367, currentY + 6, { width: empWidths[2] - 10 });
    doc.font('Helvetica-Bold').text(String(e.total_hours ?? e.hours ?? 0) + ' hrs', 467, currentY + 6, { width: empWidths[3] - 10, align: 'right' });

    currentY += 22;
  });

  // --- GLOBAL FOOTER WITH PAGE NUMBERS (2-Pass Buffer Range) ---
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const footerY = 805;

    doc.rect(36, footerY - 10, 523, 0.5).fill(borderColor);

    doc
      .fillColor(subtextColor)
      .fontSize(8)
      .font('Helvetica')
      .text('QuoteMaster Business Analytics Report • Confidential', 36, footerY, { align: 'left' });

    doc
      .fillColor(subtextColor)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(`Page ${i + 1} of ${range.count}`, 36, footerY, { align: 'right' });
  }

  doc.end();
}

module.exports = {
  generateExcelReport,
  generatePdfReport,
};
