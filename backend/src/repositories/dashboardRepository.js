const BaseRepository = require('./baseRepository');
const { formatCurrency } = require('../helpers/quotationHelper');

class DashboardRepository extends BaseRepository {
  /**
   * Get top metric cards (Total Quotations, Drafts, Approved, Total Clients)
   */
  async getMetrics(client = null) {
    const sql = `
      SELECT 
        COUNT(q.id)::int AS total_quotations,
        (SELECT COUNT(*) FROM "tblClients")::int AS total_clients,
        (SELECT COUNT(*) FROM "tblEmployees")::int AS total_employees,
        COALESCE(SUM(q.grand_total), 0.00) AS total_revenue
      FROM "tblQuotations" q;
    `;
    const result = await this.query(sql, [], client);
    const row = result.rows[0] || {};
    const total_revenue = parseFloat(row.total_revenue || 0);

    return {
      total_quotations: parseInt(row.total_quotations || 0, 10),
      total_clients: parseInt(row.total_clients || 0, 10),
      total_employees: parseInt(row.total_employees || 0, 10),
      total_revenue,
      total_revenue_formatted: formatCurrency(total_revenue),
    };
  }

  /**
   * Get Monthly Quotations count for bar chart (Guarantees last 6 consecutive months with 0-fill)
   */
  async getMonthlyQuotations(client = null) {
    const sql = `
      SELECT 
        TO_CHAR(created_at, 'Mon') AS month,
        TO_CHAR(created_at, 'YYYY-MM') AS year_month,
        COUNT(id)::int AS count
      FROM "tblQuotations"
      GROUP BY TO_CHAR(created_at, 'Mon'), TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY year_month ASC;
    `;
    const result = await this.query(sql, [], client);

    const dbMap = new Map();
    result.rows.forEach((row) => dbMap.set(row.year_month, row));

    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      const yearStr = d.getFullYear();
      const monthNumStr = String(d.getMonth() + 1).padStart(2, '0');
      const ym = `${yearStr}-${monthNumStr}`;
      last6Months.push({ month: monthStr, year_month: ym });
    }

    return last6Months.map((m) => {
      const row = dbMap.get(m.year_month);
      return {
        month: m.month,
        year_month: m.year_month,
        count: row ? parseInt(row.count, 10) : 0,
      };
    });
  }

  /**
   * Get Recent Activity Stream
   */
  async getRecentActivity(client = null) {
    const sql = `
      (
        SELECT 
          'quotation' AS type,
          q.id,
          'Quotation ' || q.quotation_number || ' updated for ' || COALESCE(c.company_name, c.name, 'Client') AS description,
          q.updated_at AS raw_timestamp,
          TO_CHAR(q.updated_at, 'YYYY-MM-DD') AS timestamp
        FROM "tblQuotations" q
        LEFT JOIN "tblClients" c ON q.client_id = c.id
      )
      UNION ALL
      (
        SELECT 
          'client' AS type,
          c.id,
          'New client ' || COALESCE(c.company_name, c.name) || ' added' AS description,
          c.created_at AS raw_timestamp,
          TO_CHAR(c.created_at, 'YYYY-MM-DD') AS timestamp
        FROM "tblClients" c
      )
      ORDER BY raw_timestamp DESC
      LIMIT 10;
    `;
    const result = await this.query(sql, [], client);
    return result.rows.map((row) => ({
      type: row.type,
      id: row.id,
      description: row.description,
      timestamp: row.timestamp,
    }));
  }

  /**
   * Get Recent 10 Quotations table
   */
  async getRecentQuotations(client = null) {
    const sql = `
      SELECT 
        q.id,
        q.quotation_number,
        COALESCE(c.company_name, c.name, 'N/A') AS client_name,
        q.grand_total AS amount,
        'N/A' AS status,
        TO_CHAR(q.created_at, 'YYYY-MM-DD') AS date
      FROM "tblQuotations" q
      LEFT JOIN "tblClients" c ON q.client_id = c.id
      ORDER BY q.created_at DESC
      LIMIT 10;
    `;
    const result = await this.query(sql, [], client);
    return result.rows.map((row) => {
      const amt = parseFloat(row.amount);
      return {
        id: row.id,
        quotation_number: row.quotation_number,
        client: row.client_name,
        date: row.date,
        amount: amt,
        amount_formatted: formatCurrency(amt),
        status: row.status,
      };
    });
  }
}

module.exports = new DashboardRepository();
