const PDFDocument = require('pdfkit');
const { formatCurrency, formatDate } = require('../helpers/quotationHelper');

/**
 * Generate PDF Document Stream for a Single Quotation (Matching Step 8 UI Preview)
 */
function generateQuotationPdf(summaryData, res) {
  const doc = new PDFDocument({ margin: 36, size: 'A4', bufferPages: true });
  doc.pipe(res);

  const quotation = summaryData.quotation || {};
  const client = summaryData.client || {};
  const scopes = summaryData.scopes || [];
  const team = summaryData.team || [];
  const milestones = summaryData.milestones || [];

  const primaryColor = '#6C5CE7';
  const textColor = '#2D3436';
  const subtextColor = '#636E72';
  const borderColor = '#E2E8F0';
  const cardBg = '#F8FAFC';

  let currentY = 36;

  // --- 1. TOP HEADER BANNER ---
  doc.roundedRect(36, currentY, 32, 32, 6).fill(primaryColor);
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('Q', 44, currentY + 7);

  doc
    .fillColor(textColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Aneka Labs Pvt. Ltd.', 300, currentY, { align: 'right' });

  doc
    .fillColor(subtextColor)
    .fontSize(8)
    .font('Helvetica')
    .text('Building Digital Excellence', 300, currentY + 14, { align: 'right' })
    .text('info@anekalabs.com | +91 20 1234 5678', 300, currentY + 26, { align: 'right' });

  currentY += 45;
  doc.rect(36, currentY, 523, 1).fill(borderColor);
  currentY += 12;

  // --- 2. CLIENT DETAILS & PROPOSAL METADATA ---
  const metadataY = currentY;

  // Left Column: Client Details
  doc.fillColor(subtextColor).fontSize(8).font('Helvetica-Bold').text('TO / CLIENT INFO:', 36, metadataY);
  doc
    .fillColor(primaryColor)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(client.company_name || client.name || 'Client', 36, metadataY + 12);

  doc
    .fillColor(textColor)
    .fontSize(8)
    .font('Helvetica')
    .text(`Contact: ${client.contact_person || client.name || '-'}`, 36, metadataY + 26)
    .text(`Email: ${client.email || '-'} | Phone: ${client.phone || '-'}`, 36, metadataY + 38)
    .text(`GST: ${client.gst_number || '-'} | PAN: ${client.pan_number || '-'}`, 36, metadataY + 50);

  // Right Column: Proposal Metadata
  const createdDateStr = quotation.proposal_date ? formatDate(quotation.proposal_date) : (quotation.created_at ? formatDate(quotation.created_at) : '-');
  const validTillStr = quotation.valid_till ? formatDate(quotation.valid_till) : '-';

  doc
    .fillColor(textColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('QUOTATION', 300, metadataY + 10, { align: 'right' })
    .fillColor(primaryColor)
    .fontSize(9)
    .text(`#${quotation.quotation_number || 'QT-AUTO'}`, 300, metadataY + 26, { align: 'right' })
    .fillColor(subtextColor)
    .fontSize(8)
    .font('Helvetica')
    .text(`Date: ${createdDateStr}`, 300, metadataY + 38, { align: 'right' })
    .text(`Valid Till: ${validTillStr}`, 300, metadataY + 50, { align: 'right' });

  currentY += 66;
  doc.rect(36, currentY, 523, 1).fill(borderColor);
  currentY += 10;

  // --- 3. SUBJECT & SUMMARY ---
  doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text(`Subject: ${quotation.title || 'Quotation'}`, 36, currentY);
  currentY += 14;
  if (quotation.project_summary || quotation.description) {
    doc.fillColor(subtextColor).fontSize(8).font('Helvetica').text(`Scope Summary: ${quotation.project_summary || quotation.description}`, 36, currentY, { width: 523 });
    currentY += 18;
  }

  doc.rect(36, currentY, 523, 1).fill(borderColor);
  currentY += 12;

  // --- 4. STEP 3 & 4: SCOPE OF WORK & ESTIMATION TABLE ---
  doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('1. Scope of Work & Modules', 36, currentY);
  currentY += 16;

  // Scope Table Header
  doc.rect(36, currentY, 523, 18).fill('#F1F5F9');
  doc.fillColor(subtextColor).fontSize(8).font('Helvetica-Bold');
  doc.text('#', 42, currentY + 5, { width: 20 });
  doc.text('MODULE / FUNCTIONALITY', 65, currentY + 5, { width: 170 });
  doc.text('CATEGORY / PRIORITY', 240, currentY + 5, { width: 120 });
  doc.text('EST. HOURS', 370, currentY + 5, { width: 70, align: 'right' });
  doc.text('EST. DAYS', 450, currentY + 5, { width: 70, align: 'right' });
  currentY += 18;

  let globalModIndex = 1;
  let totalEffortHoursSum = 0;
  let totalEffortDaysSum = 0;

  scopes.forEach((sc) => {
    (sc.functionalities || []).forEach((fn) => {
      if (currentY > 740) {
        doc.addPage();
        currentY = 40;
      }

      const rowBg = globalModIndex % 2 === 1 ? '#FFFFFF' : cardBg;
      doc.rect(36, currentY, 523, 18).fillAndStroke(rowBg, borderColor);

      const hrs = parseFloat(fn.est_hours || 0);
      const days = parseFloat(fn.est_days || fn.timeline_days || 0);
      totalEffortHoursSum += hrs;
      totalEffortDaysSum += days;

      doc.fillColor(textColor).fontSize(8).font('Helvetica');
      doc.text(String(globalModIndex++), 42, currentY + 5, { width: 20 });
      doc.text(fn.title || fn.module || '', 65, currentY + 5, { width: 170 });
      doc.text(`${fn.category || 'Core'} (${fn.priority || 'Medium'})`, 240, currentY + 5, { width: 120 });
      doc.text(String(hrs), 370, currentY + 5, { width: 70, align: 'right' });
      doc.font('Helvetica-Bold').text(String(days), 450, currentY + 5, { width: 70, align: 'right' });

      currentY += 18;
    });
  });

  // Scope Total Row
  doc.rect(36, currentY, 523, 18).fill('#EEF2FF');
  doc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold');
  doc.text('Total Effort', 65, currentY + 5, { width: 200 });
  doc.text(`${totalEffortHoursSum} Hrs`, 370, currentY + 5, { width: 70, align: 'right' });
  doc.text(`${totalEffortDaysSum} Days`, 450, currentY + 5, { width: 70, align: 'right' });
  currentY += 26;

  // --- 5. ESTIMATION & TEAM COST SUMMARY ---
  if (currentY > 640) {
    doc.addPage();
    currentY = 40;
  }

  doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('2. Estimation & Team Costing Summary', 36, currentY);
  currentY += 14;

  const teamColWidths = [140, 110, 80, 80, 80];
  doc.rect(36, currentY, 523, 18).fill('#F1F5F9');
  doc.fillColor(subtextColor).fontSize(8).font('Helvetica-Bold');
  let xAcc = 44;
  doc.text('MEMBER / ROLE', xAcc, currentY + 5, { width: teamColWidths[0] }); xAcc += teamColWidths[0];
  doc.text('SKILL', xAcc, currentY + 5, { width: teamColWidths[1] }); xAcc += teamColWidths[1];
  doc.text('HOURS', xAcc, currentY + 5, { width: teamColWidths[2], align: 'right' }); xAcc += teamColWidths[2];
  doc.text('RATE/HR', xAcc, currentY + 5, { width: teamColWidths[3], align: 'right' }); xAcc += teamColWidths[3];
  doc.text('COST', xAcc, currentY + 5, { width: teamColWidths[4], align: 'right' });

  currentY += 18;

  team.forEach((t, idx) => {
    if (currentY > 740) {
      doc.addPage();
      currentY = 40;
    }

    const rowBg = idx % 2 === 0 ? '#FFFFFF' : cardBg;
    doc.rect(36, currentY, 523, 18).fillAndStroke(rowBg, borderColor);

    doc.fillColor(textColor).fontSize(8).font('Helvetica');
    xAcc = 44;
    doc.text(`${t.name || 'Member'} (${t.role_designation || 'Role'})`, xAcc, currentY + 5, { width: teamColWidths[0] }); xAcc += teamColWidths[0];
    doc.text(t.technology_skill || '-', xAcc, currentY + 5, { width: teamColWidths[1] }); xAcc += teamColWidths[1];
    doc.text(String(t.hours || 0), xAcc, currentY + 5, { width: teamColWidths[2], align: 'right' }); xAcc += teamColWidths[2];
    doc.text(t.hourly_rate_formatted || formatCurrency(t.hourly_rate), xAcc, currentY + 5, { width: teamColWidths[3], align: 'right' }); xAcc += teamColWidths[3];
    doc.font('Helvetica-Bold').text(t.total_cost_formatted || formatCurrency(t.total_cost), xAcc, currentY + 5, { width: teamColWidths[4], align: 'right' });

    currentY += 18;
  });

  currentY += 15;

  // --- 6. COMMERCIAL SUMMARY BOX ---
  if (currentY > 660) {
    doc.addPage();
    currentY = 40;
  }

  doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('3. Commercial Summary', 36, currentY);
  currentY += 14;

  const finalExclGst = quotation.total_outstanding_pricing_excl_gst || quotation.team_total_project_cost || quotation.grand_total || 0;
  const gstVal = quotation.gst_amount || (finalExclGst * 0.18);
  const discountVal = quotation.discount_amount || 0;
  const netTotal = quotation.final_outstanding_amount || quotation.grand_total || (finalExclGst + gstVal - discountVal);

  doc.roundedRect(36, currentY, 523, 65, 6).fillAndStroke(cardBg, borderColor);
  
  doc.fillColor(textColor).fontSize(8).font('Helvetica');
  doc.text('Total Outstanding Pricing (Excl. GST):', 50, currentY + 10);
  doc.font('Helvetica-Bold').text(formatCurrency(finalExclGst), 400, currentY + 10, { width: 140, align: 'right' });

  const gstPercent = quotation.gst_percentage !== undefined && quotation.gst_percentage !== null ? quotation.gst_percentage : 18;
  doc.font('Helvetica').text(`GST (${gstPercent}%):`, 50, currentY + 24);
  doc.font('Helvetica-Bold').text(`+ ${formatCurrency(gstVal)}`, 400, currentY + 24, { width: 140, align: 'right' });

  if (discountVal > 0) {
    doc.font('Helvetica').text('Discount:', 50, currentY + 36);
    doc.font('Helvetica-Bold').text(`- ${formatCurrency(discountVal)}`, 400, currentY + 36, { width: 140, align: 'right' });
  }

  doc.rect(48, currentY + 48, 500, 0.5).fill(borderColor);
  doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('Final Outstanding Amount:', 50, currentY + 52);
  doc.fontSize(11).text(formatCurrency(netTotal), 400, currentY + 52, { width: 140, align: 'right' });

  currentY += 78;

  // --- 7. TIMELINE MILESTONES ---
  if (milestones.length > 0) {
    if (currentY > 680) {
      doc.addPage();
      currentY = 40;
    }

    doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text('4. Timeline Overview & Milestones', 36, currentY);
    currentY += 14;

    milestones.forEach((m) => {
      doc.rect(36, currentY, 523, 16).fillAndStroke('#FFFFFF', borderColor);
      doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text(m.milestone_name, 44, currentY + 4, { width: 180 });
      doc.font('Helvetica').text(m.milestone_subtext || '', 230, currentY + 4, { width: 180 });
      doc.font('Helvetica-Bold').text(`${m.duration_days} Days`, 420, currentY + 4, { width: 130, align: 'right' });
      currentY += 16;
    });

    currentY += 15;
  }

  // --- 8. IMPORTANT NOTES & SIGNATURE ---
  if (currentY > 680) {
    doc.addPage();
    currentY = 40;
  }

  doc.rect(36, currentY, 523, 1).fill(borderColor);
  currentY += 10;

  const notesY = currentY;
  doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold').text('Important Notes:', 36, notesY);
  doc
    .fillColor(subtextColor)
    .fontSize(8)
    .font('Helvetica')
    .text('1. Quotation valid as per date specified above.', 36, notesY + 12)
    .text('2. All payments to be made as per agreed terms.', 36, notesY + 22)
    .text('3. Taxes applicable at the time of invoicing.', 36, notesY + 32);

  // Signature Block
  doc.rect(380, notesY + 30, 175, 1).fill(subtextColor);
  doc
    .fillColor(subtextColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Authorized Signatory', 380, notesY + 34, { width: 175, align: 'center' });

  // Page numbering
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const footerY = 805;

    doc.rect(36, footerY - 8, 523, 0.5).fill(borderColor);

    doc
      .fillColor(subtextColor)
      .fontSize(8)
      .font('Helvetica')
      .text('Aneka Labs Pvt. Ltd. • Confidential Proposal Document', 36, footerY, { align: 'left' });

    doc
      .fillColor(subtextColor)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(`Page ${i + 1} of ${range.count}`, 36, footerY, { align: 'right' });
  }

  doc.end();
}

module.exports = {
  generateQuotationPdf,
};

