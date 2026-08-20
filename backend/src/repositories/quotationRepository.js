
const BaseRepository = require('./baseRepository');
const { formatCurrency, formatDate } = require('../helpers/quotationHelper');

const formatQuotation = (q) => {
  if (!q) return null;
  return {
    ...q,
    wizard_step: parseInt(q.wizard_step || 1, 10),
    total_effort_hours: parseFloat(q.total_effort_hours || 0),
    companyId: q.companyId ? parseInt(q.companyId, 10) : null,
    branchId: q.branchId ? parseInt(q.branchId, 10) : null,
    companyName: q.companyName || null,
    branchName: q.branchName || null,
    productivity_basis: parseFloat(q.productivity_basis || 8.00),
    average_productivity: parseFloat(q.average_productivity || 8.00),
    estimation_effort_cost: parseFloat(q.estimation_effort_cost || 0),
    estimation_contingency_percentage: parseFloat(q.estimation_contingency_percentage || 5.00),
    estimation_contingency_amount: parseFloat(q.estimation_contingency_amount || 0),
    estimation_subtotal: parseFloat(q.estimation_subtotal || 0),
    estimation_profit_margin_percentage: parseFloat(q.estimation_profit_margin_percentage || 20.00),
    estimation_profit_margin_amount: parseFloat(q.estimation_profit_margin_amount || 0),
    estimated_project_cost: parseFloat(q.estimated_project_cost || 0),

    total_labor_cost: parseFloat(q.total_labor_cost || 0),
    travel_expenses: parseFloat(q.travel_expenses || 0),
    third_party_tools_cost: parseFloat(q.third_party_tools_cost || 0),
    infrastructure_hosting_cost: parseFloat(q.infrastructure_hosting_cost || 0),
    team_subtotal: parseFloat(q.team_subtotal || 0),
    team_contingency_percentage: parseFloat(q.team_contingency_percentage || 5.00),
    team_contingency_amount: parseFloat(q.team_contingency_amount || 0),
    team_subtotal_after_contingency: parseFloat(q.team_subtotal_after_contingency || 0),
    team_profit_margin_percentage: parseFloat(q.team_profit_margin_percentage || 15.00),
    team_profit_margin_amount: parseFloat(q.team_profit_margin_amount || 0),
    team_total_project_cost: parseFloat(q.team_total_project_cost || 0),

    total_outstanding_pricing_excl_gst: parseFloat(q.total_outstanding_pricing_excl_gst || 0),
    gst_percentage: parseFloat(q.gst_percentage || 18.00),
    gst_amount: parseFloat(q.gst_amount || 0),
    discount_type: q.discount_type || 'PERCENTAGE',
    discount_value: parseFloat(q.discount_value || 0),
    discount_amount: parseFloat(q.discount_amount || 0),
    final_outstanding_amount: parseFloat(q.final_outstanding_amount || q.grand_total || 0),

    total_timeline_days: parseInt(q.total_timeline_days || 0, 10),
    working_days: parseInt(q.working_days || 0, 10),
    grand_total: parseFloat(q.final_outstanding_amount || q.grand_total || 0),
    grand_total_formatted: formatCurrency(q.final_outstanding_amount || q.grand_total || 0),

    // Normalize DATE fields to plain YYYY-MM-DD strings to prevent UTC off-by-one issue on IST (+5:30)
    proposal_date: q.proposal_date ? formatDate(q.proposal_date) : null,
    valid_till: q.valid_till ? formatDate(q.valid_till) : null,
    project_start_date: q.project_start_date ? formatDate(q.project_start_date) : null,
    project_end_date: q.project_end_date ? formatDate(q.project_end_date) : null,
  };
};

class QuotationRepository extends BaseRepository {
  async getNextSequenceNumber(client = null) {
    const sql = `
      SELECT MAX(
        CAST(
          SUBSTRING(quotation_number FROM 'QTN-[0-9]{6}-([0-9]+)') AS INTEGER
        )
      ) AS max_seq
      FROM "tblQuotations"
      WHERE quotation_number ~ '^QTN-[0-9]{6}-[0-9]+$';
    `;
    const result = await this.query(sql, [], client);
    const maxSeq = parseInt(result.rows[0]?.max_seq, 10);
    if (!isNaN(maxSeq) && maxSeq > 0) {
      return maxSeq + 1;
    }
    const countSql = `SELECT COALESCE(MAX(id), 0) AS max_id FROM "tblQuotations";`;
    const countRes = await this.query(countSql, [], client);
    return parseInt(countRes.rows[0].max_id, 10) + 1;
  }

  async findByQuotationNumber(quotation_number, client = null) {
    const sql = `SELECT * FROM "tblQuotations" WHERE quotation_number = $1;`;
    const result = await this.query(sql, [quotation_number], client);
    return formatQuotation(result.rows[0]);
  }

  async create(data, client = null) {
    const {
      quotation_number,
      client_id,
      title,
      description,
      logo,
      billing_address,
      shipping_address,
      pincode,
      wizard_step = 1,
      opportunity_name,
      proposal_date,
      valid_till,
      revision_version = '1.0',
      prepared_by_id,
      prepared_by_designation,
      prepared_by_department,
      project_summary,
      engagement_type = 'Fixed Price',
      pricing_currency = 'INR',
      exchange_rate = 1.0000,
      sector,
      companyId,
      branchId,
    } = data;

    const sql = `
      INSERT INTO "tblQuotations" (
        quotation_number, client_id, title, description, logo, billing_address, shipping_address, pincode, wizard_step,
        opportunity_name, proposal_date, valid_till, revision_version, prepared_by_id,
        prepared_by_designation, prepared_by_department, project_summary, sector,
        engagement_type, pricing_currency, exchange_rate, "companyId", "branchId"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [
        quotation_number,
        client_id,
        title,
        description || project_summary || null,
        logo || null,
        billing_address || null,
        shipping_address || null,
        pincode || null,
        wizard_step,
        opportunity_name || null,
        proposal_date || null,
        valid_till || null,
        revision_version,
        parseInt(prepared_by_id, 10) || null,
        prepared_by_designation || null,
        prepared_by_department || null,
        project_summary || description || null,
        sector || null,
        engagement_type,
        pricing_currency,
        exchange_rate,
        companyId ? parseInt(companyId, 10) : null,
        branchId ? parseInt(branchId, 10) : null,
      ],
      client
    );
    return formatQuotation(result.rows[0]);
  }

  async findAll({ limit = 50, offset = 0, client_id, startDate, endDate } = {}, client = null) {
    let whereClauses = [];
    let params = [];
    let paramIdx = 1;

    if (client_id) {
      whereClauses.push(`q.client_id = $${paramIdx++}`);
      params.push(client_id);
    }

    if (startDate) {
      whereClauses.push(`DATE(q.created_at) >= $${paramIdx++}`);
      params.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`DATE(q.created_at) <= $${paramIdx++}`);
      params.push(endDate);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT q.*, c.name AS client_name, c.company_name AS client_company, c.email AS client_email,
             e.name AS prepared_by_name,
             comp."companyName", comp.pan AS company_pan, comp.gstin AS company_gstin, comp.email AS company_email, comp.phone AS company_phone, comp.website AS company_website,
             br."branchName", br."addressLine1" AS branch_address1, br."addressLine2" AS branch_address2, br.city AS branch_city, br.state AS branch_state, br.country AS branch_country, br.pincode AS branch_pincode, br.email AS branch_email, br.phone AS branch_phone
      FROM "tblQuotations" q
      LEFT JOIN "tblClients" c ON q.client_id = c.id
      LEFT JOIN "tblEmployees" e ON q.prepared_by_id = e.id
      LEFT JOIN "tblCompanyMaster" comp ON q."companyId" = comp."companyId"
      LEFT JOIN "tblBranchMaster" br ON q."branchId" = br."branchId"
      ${whereString}
      ORDER BY q.id DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++};
    `;

    params.push(limit, offset);

    const countSql = `
      SELECT COUNT(*) FROM "tblQuotations" q
      ${whereString};
    `;
    const countParams = params.slice(0, paramIdx - 3);

    const [dataRes, countRes] = await Promise.all([
      this.query(sql, params, client),
      this.query(countSql, countParams, client),
    ]);

    return {
      quotations: dataRes.rows.map(formatQuotation),
      total: parseInt(countRes.rows[0].count, 10),
    };
  }

  async findById(id, client = null) {
    const sql = `
      SELECT q.*, c.name AS client_name, c.email AS client_email, c.company_name AS client_company,
             c.contact_person AS client_contact_person, c.phone AS client_phone, c.address AS client_address,
             c.website AS client_website, c.gst_number AS client_gst_number, c.pan_number AS client_pan_number,
             c.currency AS client_currency, c.country AS client_country, c.state AS client_state, c.city AS client_city, c.district AS client_district,
             e.name AS prepared_by_name,
             comp."companyName", comp.pan AS company_pan, comp.gstin AS company_gstin, comp.email AS company_email, comp.phone AS company_phone, comp.website AS company_website,
             br."branchName", br."addressLine1" AS branch_address1, br."addressLine2" AS branch_address2, br.city AS branch_city, br.state AS branch_state, br.country AS branch_country, br.pincode AS branch_pincode, br.email AS branch_email, br.phone AS branch_phone
      FROM "tblQuotations" q
      LEFT JOIN "tblClients" c ON q.client_id = c.id
      LEFT JOIN "tblEmployees" e ON q.prepared_by_id = e.id
      LEFT JOIN "tblCompanyMaster" comp ON q."companyId" = comp."companyId"
      LEFT JOIN "tblBranchMaster" br ON q."branchId" = br."branchId"
      WHERE q.id = $1;
    `;
    const result = await this.query(sql, [id], client);
    return formatQuotation(result.rows[0]);
  }

  async update(id, fields, client = null) {
    const allowedFields = [
      'client_id', 'title', 'description', 'logo', 'billing_address', 'shipping_address', 'pincode', 'wizard_step', 'opportunity_name',
      'proposal_date', 'valid_till', 'revision_version', 'prepared_by_id', 'prepared_by_designation',
      'prepared_by_department', 'project_summary', 'sector', 'engagement_type', 'pricing_currency', 'exchange_rate',
      'companyId', 'branchId',
      'total_effort_hours', 'productivity_basis', 'average_productivity', 'estimation_effort_cost',
      'estimation_contingency_percentage', 'estimation_contingency_amount', 'estimation_subtotal',
      'estimation_profit_margin_percentage', 'estimation_profit_margin_amount', 'estimated_project_cost',
      'estimation_notes', 'total_labor_cost', 'travel_expenses', 'third_party_tools_cost',
      'infrastructure_hosting_cost', 'team_subtotal', 'team_contingency_percentage', 'team_contingency_amount',
      'team_subtotal_after_contingency', 'team_profit_margin_percentage', 'team_profit_margin_amount',
      'team_total_project_cost', 'working_days_per_month', 'working_hours_per_day', 'total_working_hours_per_month',
      'total_outstanding_pricing_excl_gst', 'gst_percentage', 'gst_amount', 'discount_type', 'discount_value',
      'discount_amount', 'final_outstanding_amount', 'project_start_date', 'project_end_date', 'working_days',
      'total_timeline_days', 'important_notes', 'grand_total'
    ];

    let setClauses = [];
    let params = [];
    let paramIdx = 1;

    Object.keys(fields).forEach((key) => {
      if (allowedFields.includes(key) && fields[key] !== undefined) {
        setClauses.push(`"${key}" = $${paramIdx++}`);
        params.push(fields[key]);
      }
    });

    if (setClauses.length === 0) {
      return this.findById(id, client);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `
      UPDATE "tblQuotations"
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIdx}
      RETURNING *;
    `;
    const result = await this.query(sql, params, client);
    return formatQuotation(result.rows[0]);
  }

  async updateCalculatedTotals(id, { total_timeline_days, grand_total, final_outstanding_amount }, client = null) {
    const sql = `
      UPDATE "tblQuotations"
      SET total_timeline_days = COALESCE($1, total_timeline_days),
          grand_total = COALESCE($2, grand_total),
          final_outstanding_amount = COALESCE($3, final_outstanding_amount, grand_total),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const result = await this.query(sql, [total_timeline_days, grand_total, final_outstanding_amount || grand_total, id], client);
    return formatQuotation(result.rows[0]);
  }

  async delete(id, client = null) {
    const sql = `DELETE FROM "tblQuotations" WHERE id = $1 RETURNING *;`;
    const result = await this.query(sql, [id], client);
    return formatQuotation(result.rows[0]);
  }

  /**
   * Complete Quotation Summary query joining Client, Scopes, Functionalities, Team, and Milestones
   */
  async getFullSummary(quotationId, client = null) {
    const quotation = await this.findById(quotationId, client);
    if (!quotation) return null;

    // Scopes with Functionalities
    const scopesSql = `
      SELECT s.id AS scope_id, s.module AS scope_module, s.title AS scope_title, s.subtext AS scope_subtext,
             s.description AS scope_description, s.category AS scope_category, s.priority AS scope_priority,
             s.est_hours AS scope_est_hours, s.est_days AS scope_est_days, s.timeline_days AS scope_timeline_days,
             s.rate_per_hour AS scope_rate_per_hour, s.effort_cost AS scope_effort_cost,
             s.complexity AS scope_complexity, s.sort_order AS scope_sort_order,
             f.id AS functionality_id, f.module AS functionality_module, f.title AS functionality_title,
             f.description AS functionality_description, f.category, f.priority, f.est_hours, f.est_days,
             f.timeline_days, f.rate_per_hour, f.effort_cost, f.complexity, f.sort_order
      FROM "tblQuotationScopes" s
      LEFT JOIN "tblQuotationFunctionalities" f ON s.id = f.scope_id
      WHERE s.quotation_id = $1
      ORDER BY COALESCE(s.sort_order, s.id) ASC, s.id ASC, COALESCE(f.sort_order, f.id) ASC;
    `;
    const scopesRes = await this.query(scopesSql, [quotationId], client);

    const scopesMap = new Map();
    scopesRes.rows.forEach((row) => {
      if (!scopesMap.has(row.scope_id)) {
        const scopeTitle = row.scope_title || row.scope_module || '';
        const scopeSubtext = row.scope_subtext || '';
        scopesMap.set(row.scope_id, {
          id: row.scope_id,
          module: row.scope_module || '',
          title: scopeTitle,
          subtext: scopeSubtext,
          module_subtext: scopeSubtext,
          description: row.scope_description || '',
          category: row.scope_category || 'Core',
          priority: row.scope_priority || 'Medium',
          est_hours: parseFloat(row.scope_est_hours || 0),
          est_days: parseFloat(row.scope_est_days || 0),
          timeline_days: parseInt(row.scope_timeline_days || row.scope_est_days || 0, 10),
          rate_per_hour: parseFloat(row.scope_rate_per_hour || 1200),
          effort_cost: parseFloat(row.scope_effort_cost || 0),
          complexity: row.scope_complexity || 'Medium',
          sort_order: parseInt(row.scope_sort_order || 0, 10),
          functionalities: [],
        });
      }
      if (row.functionality_id) {
        scopesMap.get(row.scope_id).functionalities.push({
          id: row.functionality_id,
          module: row.functionality_module || '',
          title: row.functionality_title,
          functionality: row.functionality_title,
          description: row.functionality_description || '',
          category: row.category || 'Core',
          priority: row.priority || 'Medium',
          est_hours: parseFloat(row.est_hours || 0),
          est_days: parseFloat(row.est_days || 0),
          timeline_days: parseInt(row.timeline_days || 0, 10),
          rate_per_hour: parseFloat(row.rate_per_hour || 1200),
          effort_cost: parseFloat(row.effort_cost || 0),
          complexity: row.complexity || 'Medium',
          sort_order: parseInt(row.sort_order || 0, 10),
        });
      }
    });

    // Team Members
    const teamSql = `
      SELECT qt.id AS team_id, qt.employee_id, e.name AS employee_name, e.employee_code,
             e.email AS employee_email, COALESCE(qt.role_designation, e.role, e.designation) AS role_designation,
             qt.technology_skill, qt.hours, qt.days, qt.hours_per_day, qt.working_days, qt.hourly_rate, qt.total_cost, qt.sort_order
      FROM "tblQuotationTeam" qt
      LEFT JOIN "tblEmployees" e ON qt.employee_id = e.id
      WHERE qt.quotation_id = $1
      ORDER BY COALESCE(qt.sort_order, qt.id) ASC;
    `;
    const teamRes = await this.query(teamSql, [quotationId], client);

    // Milestones
    const milestonesSql = `
      SELECT * FROM "tblQuotationMilestones"
      WHERE quotation_id = $1
      ORDER BY sort_order ASC, id ASC;
    `;
    const milestonesRes = await this.query(milestonesSql, [quotationId], client);

    // Fetch total effort cost from functionalities
    const effortCostSql = `
      SELECT COALESCE(SUM(effort_cost), 0) AS total_effort_cost 
      FROM "tblQuotationFunctionalities" 
      WHERE scope_id IN (SELECT id FROM "tblQuotationScopes" WHERE quotation_id = $1);
    `;
    const effortCostRes = await this.query(effortCostSql, [quotationId], client);
    let totalEffortCost = parseFloat(effortCostRes.rows[0].total_effort_cost || 0);

    if (totalEffortCost === 0) {
      totalEffortCost = parseFloat(quotation.estimation_effort_cost || 0);
    }

    // Fetch GST, SGST, IGST from tblTaxMaster
    const taxSql = `SELECT "taxName", "taxRate" FROM "tblTaxMaster" WHERE status = true;`;
    const taxRes = await this.query(taxSql, [], client);
    const taxes = {};
    taxRes.rows.forEach(r => {
      taxes[r.taxName.toUpperCase()] = parseFloat(r.taxRate || 0);
    });

    const gstRate = taxes['GST'] !== undefined ? taxes['GST'] : 9.00;
    const sgstRate = taxes['SGST'] !== undefined ? taxes['SGST'] : 9.00;
    const igstRate = taxes['IGST'] !== undefined ? taxes['IGST'] : 18.00;

    const gstValue = (totalEffortCost * gstRate) / 100;
    const sgstValue = (totalEffortCost * sgstRate) / 100;
    const igstValue = (totalEffortCost * igstRate) / 100;

    const estContingencyPercentage = parseFloat(quotation.estimation_contingency_percentage || 5.00);
    const estContingencyValue = (totalEffortCost * estContingencyPercentage) / 100;

    const estProfitMarginPercentage = parseFloat(quotation.estimation_profit_margin_percentage || 20.00);
    const estProfitMarginValue = ((totalEffortCost + estContingencyValue) * estProfitMarginPercentage) / 100;

    const estimatedProjectCost = totalEffortCost + estContingencyValue + estProfitMarginValue + gstValue + sgstValue + igstValue;

    const estimation_summary = {
      total_effort_cost: totalEffortCost,
      total_effort_cost_formatted: formatCurrency(totalEffortCost),
      gst_percentage: gstRate,
      gst_value: gstValue,
      gst_value_formatted: formatCurrency(gstValue),
      sgst_percentage: sgstRate,
      sgst_value: sgstValue,
      sgst_value_formatted: formatCurrency(sgstValue),
      igst_percentage: igstRate,
      igst_value: igstValue,
      igst_value_formatted: formatCurrency(igstValue),
      contingency_percentage: estContingencyPercentage,
      contingency_value: estContingencyValue,
      contingency_value_formatted: formatCurrency(estContingencyValue),
      profit_margin_percentage: estProfitMarginPercentage,
      profit_margin_value: estProfitMarginValue,
      profit_margin_value_formatted: formatCurrency(estProfitMarginValue),
      estimated_project_cost: estimatedProjectCost,
      estimated_project_cost_formatted: formatCurrency(estimatedProjectCost),
    };

    const totalLaborCost = parseFloat(quotation.total_labor_cost || 0);
    const travelExpenses = parseFloat(quotation.travel_expenses || 0);
    const thirdPartyToolsCost = parseFloat(quotation.third_party_tools_cost || 0);
    const infrastructureHostingCost = parseFloat(quotation.infrastructure_hosting_cost || 0);
    const subTotal1 = parseFloat(quotation.team_subtotal || (totalLaborCost + travelExpenses + thirdPartyToolsCost + infrastructureHostingCost));
    const contingencyPercentage = parseFloat(quotation.team_contingency_percentage || 5.00);
    const contingencyAmount = parseFloat(quotation.team_contingency_amount || ((subTotal1 * contingencyPercentage) / 100));
    const subTotal2 = parseFloat(quotation.team_subtotal_after_contingency || (subTotal1 + contingencyAmount));
    const profitMarginPercentage = parseFloat(quotation.team_profit_margin_percentage || 15.00);
    const profitMarginAmount = parseFloat(quotation.team_profit_margin_amount || ((subTotal2 * profitMarginPercentage) / 100));
    const totalProjectCost = parseFloat(quotation.team_total_project_cost || (subTotal2 + profitMarginAmount));

    const totalCostSum = totalProjectCost || 1;

    const breakdownComponents = [
      {
        component: 'Labor Cost',
        calculation_basis: 'Combined resource rates x hours effort',
        amount: totalLaborCost,
        amount_formatted: formatCurrency(totalLaborCost),
        percentage: parseFloat(((totalLaborCost / totalCostSum) * 100).toFixed(1)),
      },
      {
        component: 'Travel Expenses',
        calculation_basis: 'Global travel/subsistence allowance',
        amount: travelExpenses,
        amount_formatted: formatCurrency(travelExpenses),
        percentage: parseFloat(((travelExpenses / totalCostSum) * 100).toFixed(1)),
      },
      {
        component: 'Third Party Tools & Licenses',
        calculation_basis: 'SaaS, API keys & software costs',
        amount: thirdPartyToolsCost,
        amount_formatted: formatCurrency(thirdPartyToolsCost),
        percentage: parseFloat(((thirdPartyToolsCost / totalCostSum) * 100).toFixed(1)),
      },
      {
        component: 'Infrastructure & Hosting',
        calculation_basis: 'Cloud servers, databases & deployments',
        amount: infrastructureHostingCost,
        amount_formatted: formatCurrency(infrastructureHostingCost),
        percentage: parseFloat(((infrastructureHostingCost / totalCostSum) * 100).toFixed(1)),
      },
      {
        component: 'Sub Total 1',
        calculation_basis: 'Labor Cost + Travel + Tools + Infra',
        amount: subTotal1,
        amount_formatted: formatCurrency(subTotal1),
        percentage: parseFloat(((subTotal1 / totalCostSum) * 100).toFixed(1)),
      },
      {
        component: 'Contingency',
        calculation_basis: `${contingencyPercentage}% buffer on Sub Total 1`,
        amount: contingencyAmount,
        amount_formatted: formatCurrency(contingencyAmount),
        percentage: parseFloat(((contingencyAmount / totalCostSum) * 100).toFixed(1)),
      },
      {
        component: 'Sub Total 2',
        calculation_basis: 'Sub Total 1 + Contingency',
        amount: subTotal2,
        amount_formatted: formatCurrency(subTotal2),
        percentage: parseFloat(((subTotal2 / totalCostSum) * 100).toFixed(1)),
      },
      {
        component: 'Profit Margin',
        calculation_basis: `${profitMarginPercentage}% mark-up on Sub Total 2`,
        amount: profitMarginAmount,
        amount_formatted: formatCurrency(profitMarginAmount),
        percentage: parseFloat(((profitMarginAmount / totalCostSum) * 100).toFixed(1)),
      },
      {
        component: 'Estimated Project Cost',
        calculation_basis: 'Final price to client (Grand Total)',
        amount: totalProjectCost,
        amount_formatted: formatCurrency(totalProjectCost),
        percentage: 100.0,
      },
    ];

    const cost_summary = {
      total_labor_cost: totalLaborCost,
      total_labor_cost_formatted: formatCurrency(totalLaborCost),
      travel_expenses: travelExpenses,
      travel_expenses_formatted: formatCurrency(travelExpenses),
      third_party_tools_cost: thirdPartyToolsCost,
      third_party_tools_cost_formatted: formatCurrency(thirdPartyToolsCost),
      infrastructure_hosting_cost: infrastructureHostingCost,
      infrastructure_hosting_cost_formatted: formatCurrency(infrastructureHostingCost),
      sub_total_1: subTotal1,
      sub_total_1_formatted: formatCurrency(subTotal1),
      contingency_percentage: contingencyPercentage,
      contingency_amount: contingencyAmount,
      contingency_amount_formatted: formatCurrency(contingencyAmount),
      sub_total_2: subTotal2,
      sub_total_2_formatted: formatCurrency(subTotal2),
      profit_margin_percentage: profitMarginPercentage,
      profit_margin_amount: profitMarginAmount,
      profit_margin_amount_formatted: formatCurrency(profitMarginAmount),
      total_project_cost: totalProjectCost,
      total_project_cost_formatted: formatCurrency(totalProjectCost),
      profitability_percentage: profitMarginPercentage,
      profitability_label: `${profitMarginPercentage}% Margin on Cost`,
      cost_component_breakdown: breakdownComponents,
    };

    const costing_basis = {
      working_days_per_month: parseInt(quotation.working_days_per_month || 22, 10),
      working_hours_per_day: parseInt(quotation.working_hours_per_day || 8, 10),
      total_working_hours_per_month: parseInt(quotation.total_working_hours_per_month || (parseInt(quotation.working_days_per_month || 22, 10) * parseInt(quotation.working_hours_per_day || 8, 10)), 10),
      contingency_rate_percentage: contingencyPercentage,
      profit_margin_rate_percentage: profitMarginPercentage,
      travel_expenses: travelExpenses,
      third_party_tools_cost: thirdPartyToolsCost,
      infrastructure_hosting_cost: infrastructureHostingCost,
    };

    return {
      quotation: {
        ...quotation,
        grand_total_formatted: formatCurrency(quotation.final_outstanding_amount || quotation.grand_total),
      },
      client: {
        id: quotation.client_id,
        name: quotation.client_name,
        company_name: quotation.client_company,
        contact_person: quotation.client_contact_person || quotation.client_name,
        email: quotation.client_email,
        phone: quotation.client_phone,
        address: quotation.client_address,
        website: quotation.client_website,
        gst_number: quotation.client_gst_number,
        pan_number: quotation.client_pan_number,
        currency: quotation.client_currency,
        country: quotation.client_country,
        state: quotation.client_state,
        city: quotation.client_city,
        district: quotation.client_district,
      },
      company: {
        companyId: quotation.companyId,
        companyName: quotation.companyName,
        pan: quotation.company_pan,
        gstin: quotation.company_gstin,
        email: quotation.company_email,
        phone: quotation.company_phone,
        website: quotation.company_website,
        branchId: quotation.branchId,
        branchName: quotation.branchName,
        branchAddress1: quotation.branch_address1,
        branchAddress2: quotation.branch_address2,
        branchCity: quotation.branch_city,
        branchState: quotation.branch_state,
        branchCountry: quotation.branch_country,
        branchPincode: quotation.branch_pincode,
        branchEmail: quotation.branch_email,
        branchPhone: quotation.branch_phone,
      },
      scopes: Array.from(scopesMap.values()),
      team: teamRes.rows.map((t) => ({
        id: t.team_id,
        employee_id: t.employee_id,
        employee_code: t.employee_code || '',
        name: t.employee_name || '',
        employee_name: t.employee_name || '',
        email: t.employee_email || '',
        role_designation: t.role_designation || '',
        technology_skill: t.technology_skill || '',
        hours: parseFloat(t.hours || 0),
        days: parseFloat(t.days || 0),
        hours_per_day: parseFloat(t.hours_per_day || 8),
        working_days: parseInt(t.working_days || 0, 10),
        hourly_rate: parseFloat(t.hourly_rate || 0),
        hourly_rate_formatted: formatCurrency(t.hourly_rate),
        total_cost: parseFloat(t.total_cost || 0),
        total_cost_formatted: formatCurrency(t.total_cost),
        sort_order: parseInt(t.sort_order || 0, 10),
      })),
      milestones: milestonesRes.rows.map((m) => {
        const startDate = m.start_date ? (m.start_date instanceof Date ? `${m.start_date.getFullYear()}-${String(m.start_date.getMonth() + 1).padStart(2, '0')}-${String(m.start_date.getDate()).padStart(2, '0')}` : String(m.start_date).split('T')[0]) : null;
        const endDate = m.end_date ? (m.end_date instanceof Date ? `${m.end_date.getFullYear()}-${String(m.end_date.getMonth() + 1).padStart(2, '0')}-${String(m.end_date.getDate()).padStart(2, '0')}` : String(m.end_date).split('T')[0]) : null;
        let durationDays = parseInt(m.duration_days || 0, 10);
        if ((!durationDays || durationDays <= 0) && startDate && endDate) {
          const s = new Date(startDate);
          const e = new Date(endDate);
          const diff = e.getTime() - s.getTime();
          if (!isNaN(diff) && diff >= 0) {
            durationDays = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
          }
        }
        return {
          id: m.id,
          milestone_name: m.milestone_name,
          milestone_subtext: m.milestone_subtext || '',
          start_date: startDate,
          end_date: endDate,
          duration_days: durationDays,
          sort_order: parseInt(m.sort_order || 0, 10),
        };
      }),
      cost_summary,
      costing_basis,
      estimation_summary,
    };
  }
}

module.exports = new QuotationRepository();

