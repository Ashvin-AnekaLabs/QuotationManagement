const ExcelJS = require('exceljs');

/**
 * Generate and stream an Excel spreadsheet for Quotation Timeline & Milestones
 * @param {Object} summaryData - Full summary of quotation including client, scopes, functionalities, team, milestones
 * @param {Object} res - Express HTTP response object
 */
const generateTimelineExcel = async (summaryData, res) => {
  const quotation = summaryData.quotation || {};
  const client = summaryData.client || {};
  const milestones = summaryData.milestones || [];
  const scopes = summaryData.scopes || [];

  const qNo = quotation.quotation_number || `QTN-${quotation.id || 0}`;
  const fileName = `Quotation_Timeline_${qNo}.xlsx`;

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Quotation Management System';
  workbook.lastModifiedBy = 'Quotation Management System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Timeline & Milestones', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  // Colors & Styling definitions
  const primaryFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' }, // Dark Navy Blue
  };
  const secondaryFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2F5597' }, // Steel Blue
  };
  const lightBgFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF2F2F2' },
  };

  const headerFont = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  const subHeaderFont = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  const boldFont = { name: 'Calibri', size: 10, bold: true };
  const regularFont = { name: 'Calibri', size: 10 };

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  };

  // 1. Header Banner
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'QUOTATION TIMELINE & MILESTONES REPORT';
  titleCell.fill = primaryFill;
  titleCell.font = headerFont;
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 35;

  // 2. Quotation Metadata Info
  sheet.addRow([]);
  sheet.addRow(['Quotation Number:', qNo, '', 'Client Name:', client.client_name || quotation.client_name || 'N/A']);
  sheet.addRow(['Project Title:', quotation.title || 'N/A', '', 'Opportunity:', quotation.opportunity_name || 'N/A']);
  sheet.addRow(['Total Timeline Days:', `${quotation.total_timeline_days || 0} Days`, '', 'Total Effort Hours:', `${quotation.total_effort_hours || 0} Hours`]);
  sheet.addRow(['Project Start Date:', quotation.project_start_date || 'N/A', '', 'Project End Date:', quotation.project_end_date || 'N/A']);
  sheet.addRow([]);

  // Style metadata section
  [3, 4, 5, 6].forEach((rowIdx) => {
    const row = sheet.getRow(rowIdx);
    row.height = 20;
    row.getCell(1).font = boldFont;
    row.getCell(2).font = regularFont;
    row.getCell(4).font = boldFont;
    row.getCell(5).font = regularFont;
  });

  // 3. Section Title: Timeline Milestones Schedule
  let currentRowIdx = 8;
  sheet.mergeCells(`A${currentRowIdx}:F${currentRowIdx}`);
  const mSectionCell = sheet.getCell(`A${currentRowIdx}`);
  mSectionCell.value = '1. TIMELINE MILESTONES SCHEDULE';
  mSectionCell.fill = secondaryFill;
  mSectionCell.font = subHeaderFont;
  mSectionCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  sheet.getRow(currentRowIdx).height = 24;

  currentRowIdx++;

  // Milestones Table Header
  const milestoneHeaders = ['#', 'Milestone Name', 'Subtext / Description', 'Start Date', 'End Date', 'Duration (Days)'];
  const mHeaderRow = sheet.getRow(currentRowIdx);
  milestoneHeaders.forEach((text, i) => {
    const cell = mHeaderRow.getCell(i + 1);
    cell.value = text;
    cell.fill = lightBgFill;
    cell.font = boldFont;
    cell.border = thinBorder;
    cell.alignment = { horizontal: i === 0 || i >= 3 ? 'center' : 'left', vertical: 'middle' };
  });
  mHeaderRow.height = 22;

  currentRowIdx++;

  // Populate Milestones Data
  let totalMilestoneDays = 0;
  if (milestones.length > 0) {
    milestones.forEach((m, idx) => {
      const row = sheet.getRow(currentRowIdx);
      const days = parseInt(m.duration_days || 0, 10);
      totalMilestoneDays += days;

      row.getCell(1).value = idx + 1;
      row.getCell(2).value = m.milestone_name || 'N/A';
      row.getCell(3).value = m.milestone_subtext || '';
      row.getCell(4).value = m.start_date || 'N/A';
      row.getCell(5).value = m.end_date || 'N/A';
      row.getCell(6).value = days;

      [1, 2, 3, 4, 5, 6].forEach((cIdx) => {
        const cell = row.getCell(cIdx);
        cell.font = regularFont;
        cell.border = thinBorder;
        cell.alignment = { horizontal: cIdx === 1 || cIdx >= 4 ? 'center' : 'left', vertical: 'middle' };
      });
      row.height = 20;
      currentRowIdx++;
    });

    // Total Milestones Summary Row
    const mTotalRow = sheet.getRow(currentRowIdx);
    mTotalRow.getCell(1).value = '';
    mTotalRow.getCell(2).value = 'Total Scheduled Milestone Duration';
    mTotalRow.getCell(2).font = boldFont;
    mTotalRow.getCell(6).value = `${totalMilestoneDays} Days`;
    mTotalRow.getCell(6).font = boldFont;

    [1, 2, 3, 4, 5, 6].forEach((cIdx) => {
      const cell = mTotalRow.getCell(cIdx);
      cell.border = thinBorder;
      cell.fill = lightBgFill;
      cell.alignment = { horizontal: cIdx === 6 ? 'center' : 'left', vertical: 'middle' };
    });
    mTotalRow.height = 22;
    currentRowIdx++;
  } else {
    const emptyRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:F${currentRowIdx}`);
    const emptyCell = emptyRow.getCell(1);
    emptyCell.value = 'No milestones defined for this quotation.';
    emptyCell.font = regularFont;
    emptyCell.alignment = { horizontal: 'center', vertical: 'middle' };
    emptyRow.height = 22;
    currentRowIdx++;
  }

  currentRowIdx += 2;

  // 4. Section Title: Scope & Functionality Timeline Breakdown
  sheet.mergeCells(`A${currentRowIdx}:F${currentRowIdx}`);
  const sSectionCell = sheet.getCell(`A${currentRowIdx}`);
  sSectionCell.value = '2. SCOPE & FUNCTIONALITY BREAKDOWN';
  sSectionCell.fill = secondaryFill;
  sSectionCell.font = subHeaderFont;
  sSectionCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  sheet.getRow(currentRowIdx).height = 24;

  currentRowIdx++;

  // Scopes Table Header
  const scopeHeaders = ['#', 'Scope / Module Title', 'Est. Hours', 'Timeline (Days)', 'Effort Cost', 'Complexity'];
  const sHeaderRow = sheet.getRow(currentRowIdx);
  scopeHeaders.forEach((text, i) => {
    const cell = sHeaderRow.getCell(i + 1);
    cell.value = text;
    cell.fill = lightBgFill;
    cell.font = boldFont;
    cell.border = thinBorder;
    cell.alignment = { horizontal: i === 0 || i >= 2 ? 'center' : 'left', vertical: 'middle' };
  });
  sHeaderRow.height = 22;

  currentRowIdx++;

  let totalScopeHours = 0;
  let totalScopeDays = 0;

  if (scopes.length > 0) {
    scopes.forEach((s, idx) => {
      const row = sheet.getRow(currentRowIdx);
      const estHours = parseFloat(s.est_hours || 0);
      const timelineDays = parseInt(s.timeline_days || s.est_days || 0, 10);

      totalScopeHours += estHours;
      totalScopeDays += timelineDays;

      row.getCell(1).value = idx + 1;
      row.getCell(2).value = s.title || s.name || 'N/A';
      row.getCell(3).value = estHours;
      row.getCell(4).value = timelineDays;
      row.getCell(5).value = s.effort_cost_formatted || `$${s.effort_cost || 0}`;
      row.getCell(6).value = s.complexity || 'Medium';

      [1, 2, 3, 4, 5, 6].forEach((cIdx) => {
        const cell = row.getCell(cIdx);
        cell.font = regularFont;
        cell.border = thinBorder;
        cell.alignment = { horizontal: cIdx === 1 || cIdx >= 3 ? 'center' : 'left', vertical: 'middle' };
      });
      row.height = 20;
      currentRowIdx++;
    });

    // Total Scopes Summary Row
    const sTotalRow = sheet.getRow(currentRowIdx);
    sTotalRow.getCell(1).value = '';
    sTotalRow.getCell(2).value = 'Total Scope Effort';
    sTotalRow.getCell(2).font = boldFont;
    sTotalRow.getCell(3).value = totalScopeHours;
    sTotalRow.getCell(3).font = boldFont;
    sTotalRow.getCell(4).value = `${totalScopeDays} Days`;
    sTotalRow.getCell(4).font = boldFont;

    [1, 2, 3, 4, 5, 6].forEach((cIdx) => {
      const cell = sTotalRow.getCell(cIdx);
      cell.border = thinBorder;
      cell.fill = lightBgFill;
      cell.alignment = { horizontal: cIdx >= 3 ? 'center' : 'left', vertical: 'middle' };
    });
    sTotalRow.height = 22;
  } else {
    const emptyRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:F${currentRowIdx}`);
    const emptyCell = emptyRow.getCell(1);
    emptyCell.value = 'No scopes defined for this quotation.';
    emptyCell.font = regularFont;
    emptyCell.alignment = { horizontal: 'center', vertical: 'middle' };
    emptyRow.height = 22;
  }

  // Set explicit column widths for clean readability
  sheet.columns = [
    { key: 'col1', width: 8 },
    { key: 'col2', width: 35 },
    { key: 'col3', width: 35 },
    { key: 'col4', width: 16 },
    { key: 'col5', width: 16 },
    { key: 'col6', width: 18 },
  ];

  // Send Excel stream to client
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  generateTimelineExcel,
};
