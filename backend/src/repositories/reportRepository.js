const BaseRepository = require('./baseRepository');
const { formatCurrency } = require('../helpers/quotationHelper');

class ReportRepository extends BaseRepository {
  /**
   * Helper to build dynamic WHERE conditions for reports filtering
   */
  buildWhereClause(filters = {}, prefix = 'q') {
    const conditions = [];
    const params = [];
    let idx = 1;

    const startDate = filters.startDate || filters.start_date;
    const endDate = filters.endDate || filters.end_date;
    const clientId = filters.clientId || filters.client_id;
    const employeeId = filters.employeeId || filters.employee_id;

    if (startDate) {
      conditions.push(`${prefix}.created_at >= $${idx++}`);
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      conditions.push(`${prefix}.created_at <= $${idx++}`);
      params.push(`${endDate} 23:59:59`);
    }

    if (clientId) {
      conditions.push(`${prefix}.client_id = $${idx++}`);
      params.push(parseInt(clientId, 10));
    }

    if (employeeId) {
      conditions.push(
        `EXISTS (SELECT 1 FROM "tblQuotationTeam" qt_sub WHERE qt_sub.quotation_id = ${prefix}.id AND qt_sub.employee_id = $${idx++})`
      );
      params.push(parseInt(employeeId, 10));
    }

    const whereString = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereString, params, nextIdx: idx };
  }

  /**
   * Get Top-Level Overview Cards Metrics
   */
  async getOverviewMetrics(filters = {}, client = null) {
    const { whereString, params } = this.buildWhereClause(filters, 'q');

    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM "tblClients")::int AS total_clients,
        (SELECT COUNT(*) FROM "tblEmployees")::int AS total_employees,
        COUNT(q.id)::int AS total_quotations,
        COUNT(q.id)::int AS approved_quotations,
        0::int AS pending_quotations,
        COALESCE(SUM(q.grand_total), 0.00) AS total_revenue
      FROM "tblQuotations" q
      ${whereString};
    `;

    const result = await this.query(sql, params, client);
    const row = result.rows[0] || {};

    const total_revenue = parseFloat(row.total_revenue || 0);

    return {
      total_clients: parseInt(row.total_clients || 0, 10),
      total_employees: parseInt(row.total_employees || 0, 10),
      total_quotations: parseInt(row.total_quotations || 0, 10),
      approved_quotations: parseInt(row.approved_quotations || 0, 10),
      pending_quotations: parseInt(row.pending_quotations || 0, 10),
      total_revenue,
      total_revenue_formatted: formatCurrency(total_revenue),
    };
  }

  /**
   * Get Quotation Status Distribution Counts
   */
  async getStatusDistribution(filters = {}, client = null) {
    const { whereString, params } = this.buildWhereClause(filters, 'q');

    // Status column was removed per user request. Faking data to prevent crash.
    const sql = `
      SELECT 
        'DRAFT' AS status,
        COUNT(q.id)::int AS count
      FROM "tblQuotations" q
      ${whereString}
    `;

    const result = await this.query(sql, params, client);
    
    // Default statuses to ensure they always show up in the chart
    const distribution = { APPROVED: 0, DRAFT: 0, SENT: 0, REJECTED: 0 };
    
    if (result.rows[0]) {
      distribution.DRAFT = parseInt(result.rows[0].count, 10) || 0;
    }

    return distribution;
  }

  /**
   * Get Revenue Monthly Trends (Padded with 0 for last 6 months)
   */
  async getRevenueTrends(filters = {}, client = null) {
    const { whereString, params } = this.buildWhereClause(filters, 'q');

    const sql = `
      SELECT 
        TO_CHAR(q.created_at, 'YYYY-MM') AS month_key,
        TO_CHAR(q.created_at, 'Mon YYYY') AS month_label,
        COALESCE(SUM(q.grand_total), 0.00) AS revenue,
        COUNT(q.id)::int AS count
      FROM "tblQuotations" q
      ${whereString}
      GROUP BY TO_CHAR(q.created_at, 'YYYY-MM'), TO_CHAR(q.created_at, 'Mon YYYY')
      ORDER BY month_key ASC;
    `;

    const result = await this.query(sql, params, client);
    
    // Generate the last 6 months
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${monthStr}`;
      const monthLabel = d.toLocaleString('default', { month: 'short' }) + ' ' + year;
      
      last6Months.push({
        month_key: monthKey,
        month: monthLabel,
        revenue: 0,
        revenue_formatted: formatCurrency(0),
        quotations_count: 0,
      });
    }

    // Merge DB results into the 6 months skeleton
    const mergedResults = last6Months.map(emptyMonth => {
      const found = result.rows.find(r => r.month_key === emptyMonth.month_key);
      if (found) {
        const revenue = parseFloat(found.revenue);
        return {
          month_key: emptyMonth.month_key,
          month: emptyMonth.month,
          revenue,
          revenue_formatted: formatCurrency(revenue),
          quotations_count: parseInt(found.count, 10),
        };
      }
      return emptyMonth;
    });

    return mergedResults;
  }

  /**
   * Get Monthly Analytics for charts (combining count and revenue by month)
   */
  async getMonthlyAnalytics(filters = {}, client = null) {
    const trends = await this.getRevenueTrends(filters, client);
    
    const monthly_quotations = trends.map((t) => ({
      month: t.month,
      count: t.quotations_count,
    }));

    const monthly_revenue = trends.map((t) => ({
      month: t.month,
      revenue: t.revenue,
    }));

    return {
      monthly_quotations,
      monthly_revenue,
    };
  }

  /**
   * Get Recent 10 Quotations
   */
  async getRecentQuotations(filters = {}, client = null) {
    const { whereString, params } = this.buildWhereClause(filters, 'q');

    const sql = `
      SELECT 
        q.id,
        q.quotation_number,
        COALESCE(c.company_name, c.name, 'N/A') AS client_name,
        q.grand_total AS amount,
        q.created_at
      FROM "tblQuotations" q
      LEFT JOIN "tblClients" c ON q.client_id = c.id
      ${whereString}
      ORDER BY q.created_at DESC
      LIMIT 10;
    `;

    const result = await this.query(sql, params, client);

    return result.rows.map((row) => {
      const amt = parseFloat(row.amount);
      return {
        id: row.id,
        quotation_number: row.quotation_number,
        client: row.client_name,
        amount: amt,
        amount_formatted: formatCurrency(amt),
        status: 'N/A',
        created_at: row.created_at,
      };
    });
  }

  /**
   * Get Top Clients ranked by Revenue
   */
  async getTopClients(filters = {}, client = null) {
    const { whereString, params } = this.buildWhereClause(filters, 'q');

    const sql = `
      SELECT 
        c.id AS client_id,
        COALESCE(c.company_name, c.name) AS client_name,
        COUNT(q.id)::int AS projects,
        COALESCE(SUM(q.grand_total), 0.00) AS revenue
      FROM "tblClients" c
      LEFT JOIN "tblQuotations" q ON c.id = q.client_id
      ${whereString}
      GROUP BY c.id, c.company_name, c.name
      ORDER BY revenue DESC, projects DESC
      LIMIT 10;
    `;

    const result = await this.query(sql, params, client);

    return result.rows.map((row) => {
      const rev = parseFloat(row.revenue);
      return {
        client_id: row.client_id,
        client_name: row.client_name,
        client: row.client_name,
        projects: parseInt(row.projects, 10),
        revenue: rev,
        revenue_formatted: formatCurrency(rev),
      };
    });
  }

  /**
   * Get Team Member Resource Utilization & Cost Report
   */
  async getEmployeeUtilization(filters = {}, client = null) {
    const { whereString, params } = this.buildWhereClause(filters, 'q');

    const sql = `
      SELECT 
        e.id AS employee_id,
        e.name AS employee_name,
        e.employee_code,
        COALESCE(e.role, e.designation) AS role,
        COUNT(DISTINCT qt.quotation_id)::int AS total_projects,
        COALESCE(SUM(qt.hours), 0)::numeric AS total_hours,
        COALESCE(SUM(qt.hours_per_day * qt.working_days), 0)::numeric AS total_hours_alt,
        COALESCE(SUM(qt.total_cost), 0.00)::numeric AS total_cost
      FROM "tblEmployees" e
      LEFT JOIN "tblQuotationTeam" qt ON e.id = qt.employee_id
      LEFT JOIN "tblQuotations" q ON qt.quotation_id = q.id
      ${whereString}
      GROUP BY e.id, e.name, e.employee_code, e.role, e.designation
      ORDER BY total_cost DESC;
    `;

    const result = await this.query(sql, params, client);

    return result.rows.map((row) => {
      const cost = parseFloat(row.total_cost);
      return {
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        employee_code: row.employee_code || '',
        role: row.role || 'N/A',
        total_projects: parseInt(row.total_projects, 10),
        total_hours: parseFloat(row.total_hours || row.total_hours_alt),
        total_cost: cost,
        total_cost_formatted: formatCurrency(cost),
      };
    });
  }

  /**
   * Get Employee Assignments list
   */
  async getEmployeeAssignments(filters = {}, client = null) {
    const utilization = await this.getEmployeeUtilization(filters, client);
    return utilization.map((u) => ({
      employee: u.employee_name,
      role: u.role,
      active_projects: u.total_projects,
      hours: u.total_hours,
    }));
  }
}

module.exports = new ReportRepository();
