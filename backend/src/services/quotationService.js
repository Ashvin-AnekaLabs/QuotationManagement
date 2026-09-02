const quotationRepository = require('../repositories/quotationRepository');
const clientRepository = require('../repositories/clientRepository');
const functionalityRepository = require('../repositories/functionalityRepository');
const teamRepository = require('../repositories/teamRepository');
const { generateQuotationNumber } = require('../helpers/quotationHelper');
const { generateQuotationPdf } = require('../utils/quotationPdfHelper');
const { generateTimelineExcel } = require('../utils/quotationExcelHelper');
const ApiError = require('../utils/ApiError');

class QuotationService {
  async createQuotation(data) {
    const dbClient = await quotationRepository.getTransactionClient();
    try {
      await dbClient.query('BEGIN');

      let client_id = data.client_id;
      if (client_id) {
        const clientObj = await clientRepository.findById(client_id, dbClient);
        if (!clientObj) {
          throw ApiError.notFound(`Client with ID ${client_id} does not exist`);
        }
      }

      // Auto-generate quotation number if AUTO or not provided
      let quotation_number = data.quotation_number;
      if (!quotation_number || quotation_number === 'QT-AUTO') {
        let seq = await quotationRepository.getNextSequenceNumber(dbClient);
        quotation_number = generateQuotationNumber(seq);
        
        // Safety loop: ensure generated quotation_number is completely unique
        let existing = await quotationRepository.findByQuotationNumber(quotation_number, dbClient);
        while (existing) {
          seq++;
          quotation_number = generateQuotationNumber(seq);
          existing = await quotationRepository.findByQuotationNumber(quotation_number, dbClient);
        }
      }

      const quotation = await quotationRepository.create(
        {
          ...data,
          quotation_number,
          client_id,
          title: data.title || data.subject || data.opportunity_name || 'New Proposal',
          description: data.description || data.project_summary || '',
          logo: data.logo || null,
          billing_address: data.billing_address || null,
          shipping_address: data.shipping_address || null,
          pincode: data.pincode || null,
          wizard_step: data.wizard_step || 1,
        },
        dbClient
      );

      await dbClient.query('COMMIT');
      return quotation;
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }

  async getAllQuotations(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const { quotations, total } = await quotationRepository.findAll({
      limit,
      offset,
      client_id: queryParams.client_id,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
    });

    return {
      quotations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getQuotationById(id) {
    const quotation = await quotationRepository.findById(id);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID ${id} not found`);
    }
    return quotation;
  }

  async updateQuotation(id, updateData) {
    await this.getQuotationById(id);

    if (updateData.client_id) {
      const clientObj = await clientRepository.findById(updateData.client_id);
      if (!clientObj) {
        throw ApiError.notFound(`Client with ID ${updateData.client_id} does not exist`);
      }
    }

    const updated = await quotationRepository.update(id, updateData);
    await this.syncQuotationCalculations(id);
    return updated;
  }

  async deleteQuotation(id) {
    await this.getQuotationById(id);
    return await quotationRepository.delete(id);
  }

  async getCostingSummary(id, queryParams = {}) {
    const numId = parseInt(id, 10);
    if (numId === 0) {
      const { quotations, total } = await quotationRepository.findAll({
        limit: parseInt(queryParams.limit, 10) || 100,
        offset: 0,
        client_id: queryParams.client_id,
      });

      const costingList = await Promise.all(
        quotations.map(async (q) => {
          const summary = await this.getQuotationSummary(q.id);
          return {
            quotation_id: q.id,
            quotation_number: q.quotation_number,
            title: q.title,
            cost_summary: summary.cost_summary,
            costing_basis: summary.costing_basis,
            team: summary.team,
          };
        })
      );

      return {
        total,
        count: costingList.length,
        costings: costingList,
      };
    }

    const summary = await this.getQuotationSummary(numId);
    return {
      cost_summary: summary.cost_summary,
      costing_basis: summary.costing_basis,
      team: summary.team,
    };
  }

  async updateCostingBasis(id, data) {
    await this.getQuotationById(id);

    const workingDays = data.working_days_per_month !== undefined ? parseInt(data.working_days_per_month, 10) : undefined;
    const workingHours = data.working_hours_per_day !== undefined ? parseInt(data.working_hours_per_day, 10) : undefined;

    let totalWorkingHours;
    if (workingDays !== undefined || workingHours !== undefined) {
      const q = await quotationRepository.findById(id);
      const days = workingDays !== undefined ? workingDays : (q.working_days_per_month || 22);
      const hours = workingHours !== undefined ? workingHours : (q.working_hours_per_day || 8);
      totalWorkingHours = days * hours;
    }

    const updateData = {
      ...(workingDays !== undefined && { working_days_per_month: workingDays }),
      ...(workingHours !== undefined && { working_hours_per_day: workingHours }),
      ...(totalWorkingHours !== undefined && { total_working_hours_per_month: totalWorkingHours }),
      ...(data.team_contingency_percentage !== undefined && { team_contingency_percentage: parseFloat(data.team_contingency_percentage) }),
      ...(data.contingency_rate_percentage !== undefined && { team_contingency_percentage: parseFloat(data.contingency_rate_percentage) }),
      ...(data.team_profit_margin_percentage !== undefined && { team_profit_margin_percentage: parseFloat(data.team_profit_margin_percentage) }),
      ...(data.profit_margin_rate_percentage !== undefined && { team_profit_margin_percentage: parseFloat(data.profit_margin_rate_percentage) }),
      ...(data.travel_expenses !== undefined && { travel_expenses: parseFloat(data.travel_expenses) }),
      ...(data.third_party_tools_cost !== undefined && { third_party_tools_cost: parseFloat(data.third_party_tools_cost) }),
      ...(data.infrastructure_hosting_cost !== undefined && { infrastructure_hosting_cost: parseFloat(data.infrastructure_hosting_cost) }),
    };

    await quotationRepository.update(id, updateData);
    await this.syncQuotationCalculations(id);
    return await this.getCostingSummary(id);
  }

  async getCommercial(id, queryParams = {}) {
    const numId = parseInt(id, 10);
    if (numId === 0) {
      const { quotations, total } = await quotationRepository.findAll({
        limit: parseInt(queryParams.limit, 10) || 100,
        offset: 0,
        client_id: queryParams.client_id,
      });

      const commercialList = await Promise.all(
        quotations.map(async (q) => {
          const item = await this.getCommercial(q.id);
          return {
            quotation_id: q.id,
            quotation_number: q.quotation_number,
            title: q.title,
            ...item,
          };
        })
      );

      return {
        total,
        count: commercialList.length,
        commercials: commercialList,
      };
    }

    const q = await this.getQuotationById(numId);
    const totalExclGst = parseFloat(q.total_outstanding_pricing_excl_gst || q.team_total_project_cost || q.estimated_project_cost || 0);
    const gstPercentage = parseFloat(q.gst_percentage !== undefined && q.gst_percentage !== null ? q.gst_percentage : 18.00);
    const gstAmount = parseFloat(q.gst_amount !== undefined && q.gst_amount !== null && q.gst_amount > 0 ? q.gst_amount : ((totalExclGst * gstPercentage) / 100));
    
    const discountType = String(q.discount_type || 'PERCENTAGE').toUpperCase();
    const discountValue = parseFloat(q.discount_value || 0);

    const isFlat = ['FIXED', 'FLAT', 'FLAT_AMOUNT', 'AMOUNT'].includes(discountType);
    let discountAmount = 0;
    if (isFlat) {
      discountAmount = discountValue;
    } else {
      discountAmount = ((totalExclGst + gstAmount) * discountValue) / 100;
    }

    const finalAmount = Math.max(0, (totalExclGst + gstAmount) - discountAmount);

    const { formatCurrency } = require('../helpers/quotationHelper');

    return {
      total_outstanding_pricing_excl_gst: totalExclGst,
      total_outstanding_pricing_excl_gst_formatted: formatCurrency(totalExclGst),
      gst_percentage: gstPercentage,
      gst_amount: gstAmount,
      gst_amount_formatted: formatCurrency(gstAmount),
      discount_type: discountType,
      discount_value: discountValue,
      discount_amount: discountAmount,
      discount_amount_formatted: formatCurrency(discountAmount),
      final_outstanding_amount: finalAmount,
      final_outstanding_amount_formatted: formatCurrency(finalAmount),
      grand_total: finalAmount,
      grand_total_formatted: formatCurrency(finalAmount),
    };
  }

  async updateCommercial(id, data) {
    await this.getQuotationById(id);

    const updateData = {
      ...(data.gst_percentage !== undefined && { gst_percentage: parseFloat(data.gst_percentage) }),
      ...(data.gst_amount !== undefined && { gst_amount: parseFloat(data.gst_amount) }),
      ...(data.discount_type !== undefined && { discount_type: String(data.discount_type).toUpperCase() }),
      ...(data.discount_value !== undefined && { discount_value: parseFloat(data.discount_value) }),
      ...(data.discount_amount !== undefined && { discount_amount: parseFloat(data.discount_amount) }),
    };

    await quotationRepository.update(id, updateData);
    await this.syncQuotationCalculations(id);
    return await this.getCommercial(id);
  }

  /**
   * Recalculate Total Timeline, Labor Costs, Commercials and Net Amount
   */
  async syncQuotationCalculations(quotationId, dbClient = null) {
    const timelineData = await functionalityRepository.calculateQuotationTimeline(
      quotationId,
      dbClient
    );
    const laborCost = await teamRepository.calculateQuotationGrandTotal(
      quotationId,
      dbClient
    );

    const quotation = await quotationRepository.findById(quotationId, dbClient);
    if (!quotation) return;

    let total_timeline_days = timelineData.total_timeline || quotation.total_timeline_days || 0;
    if (quotation.project_start_date && quotation.project_end_date) {
      const start = new Date(quotation.project_start_date);
      const end = new Date(quotation.project_end_date);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        total_timeline_days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
    }
    const total_effort_hours = timelineData.total_hours || quotation.total_effort_hours || 0;
    // In unified module management, the estimation effort cost is derived entirely from the team allocation cost.
    const estimation_effort_cost = laborCost || quotation.estimation_effort_cost || 0;

    // Estimation calculation
    const estimation_contingency_percentage = quotation.estimation_contingency_percentage || 5.00;
    const estimation_contingency_amount = (estimation_effort_cost * estimation_contingency_percentage) / 100;
    const estimation_subtotal = estimation_effort_cost + estimation_contingency_amount;
    const estimation_profit_margin_percentage = quotation.estimation_profit_margin_percentage || 20.00;
    const estimation_profit_margin_amount = (estimation_subtotal * estimation_profit_margin_percentage) / 100;
    const estimated_project_cost = estimation_subtotal + estimation_profit_margin_amount;

    // Commercial calculation
    const total_labor_cost = laborCost || quotation.total_labor_cost || 0;
    const team_subtotal = total_labor_cost;
    const team_contingency_amount = 0;
    const team_subtotal_after_contingency = total_labor_cost;
    const team_profit_margin_amount = 0;
    const team_total_project_cost = total_labor_cost;

    const total_outstanding_pricing_excl_gst = team_total_project_cost || estimated_project_cost || quotation.total_outstanding_pricing_excl_gst || laborCost;
    const gst_percentage = quotation.gst_percentage !== undefined && quotation.gst_percentage !== null ? parseFloat(quotation.gst_percentage) : 18.00;
    
    const discount_type = String(quotation.discount_type || 'PERCENTAGE').toUpperCase();
    const discount_value = parseFloat(quotation.discount_value || 0);

    const isFlat = ['FIXED', 'FLAT', 'FLAT_AMOUNT', 'AMOUNT'].includes(discount_type);
    
    let discount_amount = 0;
    if (isFlat) {
      discount_amount = discount_value;
    } else {
      // Calculate discount directly on the base price
      discount_amount = (total_outstanding_pricing_excl_gst * discount_value) / 100;
    }
    
    // Calculate GST on discounted base (Match with Frontend logic)
    const discounted_base = Math.max(0, total_outstanding_pricing_excl_gst - discount_amount);
    const gst_amount = (discounted_base * gst_percentage) / 100;

    const final_outstanding_amount = discounted_base + gst_amount;

    await quotationRepository.update(
      quotationId,
      {
        total_timeline_days,
        total_effort_hours,
        estimation_effort_cost,
        estimation_contingency_amount,
        estimation_subtotal,
        estimation_profit_margin_amount,
        estimated_project_cost,
        total_labor_cost,
        team_subtotal,
        team_contingency_amount,
        team_subtotal_after_contingency,
        team_profit_margin_amount,
        team_total_project_cost,
        total_outstanding_pricing_excl_gst,
        gst_amount,
        discount_amount,
        final_outstanding_amount,
        grand_total: final_outstanding_amount,
      },
      dbClient
    );
  }

  /**
   * Complete Quotation Summary (Client, Scopes, Functionalities, Team, Milestones, Totals)
   */
  async getQuotationSummary(id) {
    const summary = await quotationRepository.getFullSummary(id);
    if (!summary) {
      throw ApiError.notFound(`Quotation with ID ${id} not found`);
    }
    return summary;
  }

  /**
   * Export Quotations List as Downloadable Excel Spreadsheet
   */
  async exportQuotations(queryParams, res) {
    const { generateQuotationsListExcel } = require('../utils/exportHelper');
    // Fetch all quotations without pagination limit
    const { quotations } = await quotationRepository.findAll({
      limit: 10000, // Large enough limit to export all records
      offset: 0,
      client_id: queryParams.client_id,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
    });
    
    return generateQuotationsListExcel(quotations, res);
  }

  /**
   * Export Single Quotation Summary as Downloadable PDF
   */
  async exportQuotationPdf(id, res) {
    const summary = await this.getQuotationSummary(id);
    const qNo = summary.quotation.quotation_number || `QTN-${id}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Quotation_${qNo}.pdf"`);

    return generateQuotationPdf(summary, res);
  }

  /**
   * Export Quotation Timeline & Milestones Schedule as Downloadable Excel Spreadsheet
   */
  async exportTimelineExcel(id, res) {
    const summary = await this.getQuotationSummary(id);
    return generateTimelineExcel(summary, res);
  }
}

module.exports = new QuotationService();

