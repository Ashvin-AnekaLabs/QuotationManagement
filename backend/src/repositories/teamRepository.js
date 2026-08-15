const BaseRepository = require('./baseRepository');
const { formatCurrency } = require('../helpers/quotationHelper');

const formatTeamMember = (member) => {
  if (!member) return null;
  const empRole = member.role_designation || member.role || member.designation || member.employee_role || '';
  const empName = member.employee_name || member.name || '';
  return {
    ...member,
    employee_name: empName,
    name: empName,
    role_designation: empRole,
    role: empRole,
    designation: empRole,
    technology_skill: member.technology_skill || '',
    hours: parseFloat(member.hours || 0),
    days: parseFloat(member.days || member.working_days || 0),
    hours_per_day: parseFloat(member.hours_per_day || 8),
    working_days: parseInt(member.working_days || member.days || 0, 10),
    hourly_rate: parseFloat(member.hourly_rate || 0),
    hourly_rate_formatted: formatCurrency(member.hourly_rate || 0),
    total_cost: parseFloat(member.total_cost || 0),
    total_cost_formatted: formatCurrency(member.total_cost || 0),
    sort_order: parseInt(member.sort_order || 0, 10),
    scope_id: member.scope_id || null,
  };
};

class TeamRepository extends BaseRepository {
  async create(data, client = null) {
    const {
      quotation_id,
      employee_id,
      role_designation,
      technology_skill,
      hours_per_day = 8,
      hours = 0,
      days = 0,
      working_days,
      hourly_rate = 0,
      total_cost,
      sort_order = 0,
      scope_id = null,
    } = data;

    const computedDays = days || working_days || Math.ceil((hours || 0) / (hours_per_day || 8));
    const computedHours = hours || (computedDays * (hours_per_day || 8));
    const computedCost = total_cost !== undefined ? total_cost : (computedHours * hourly_rate);

    const sql = `
      WITH inserted AS (
        INSERT INTO "tblQuotationTeam" (
          quotation_id, employee_id, role_designation, technology_skill,
          hours_per_day, hours, days, working_days, hourly_rate, total_cost, sort_order, scope_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      )
      SELECT qt.*, e.name AS employee_name, e.email AS employee_email, e.employee_code,
             COALESCE(qt.role_designation, e.role, e.designation) AS role
      FROM inserted qt
      LEFT JOIN "tblEmployees" e ON qt.employee_id = e.id;
    `;
    const result = await this.query(
      sql,
      [
        quotation_id,
        employee_id || null,
        role_designation || null,
        technology_skill || null,
        hours_per_day,
        computedHours,
        computedDays,
        computedDays,
        hourly_rate,
        computedCost,
        sort_order,
        scope_id
      ],
      client
    );
    return formatTeamMember(result.rows[0]);
  }

  async findByQuotationId(quotation_id, client = null) {
    const sql = `
      SELECT qt.*, e.name AS employee_name, e.email AS employee_email, e.employee_code,
             COALESCE(qt.role_designation, e.role, e.designation) AS role
      FROM "tblQuotationTeam" qt
      LEFT JOIN "tblEmployees" e ON qt.employee_id = e.id
      WHERE qt.quotation_id = $1
      ORDER BY COALESCE(qt.sort_order, qt.id) ASC;
    `;
    const result = await this.query(sql, [quotation_id], client);
    return result.rows.map(formatTeamMember);
  }

  async findById(id, client = null) {
    const sql = `
      SELECT qt.*, e.name AS employee_name, e.email AS employee_email, e.employee_code,
             COALESCE(qt.role_designation, e.role, e.designation) AS role
      FROM "tblQuotationTeam" qt
      LEFT JOIN "tblEmployees" e ON qt.employee_id = e.id
      WHERE qt.id = $1;
    `;
    const result = await this.query(sql, [id], client);
    return formatTeamMember(result.rows[0]);
  }

  async findByQuotationAndEmployee(quotation_id, employee_id, client = null) {
    const sql = `
      SELECT qt.*, e.name AS employee_name, e.email AS employee_email, e.employee_code,
             COALESCE(qt.role_designation, e.role, e.designation) AS role
      FROM "tblQuotationTeam" qt
      LEFT JOIN "tblEmployees" e ON qt.employee_id = e.id
      WHERE qt.quotation_id = $1 AND qt.employee_id = $2;
    `;
    const result = await this.query(sql, [quotation_id, employee_id], client);
    return formatTeamMember(result.rows[0]);
  }

  async update(id, data, client = null) {
    const {
      role_designation,
      technology_skill,
      hours_per_day,
      hours,
      days,
      working_days,
      hourly_rate,
      total_cost,
      sort_order,
      scope_id,
    } = data;

    const sql = `
      WITH updated AS (
        UPDATE "tblQuotationTeam"
        SET role_designation = COALESCE($1, role_designation),
            technology_skill = COALESCE($2, technology_skill),
            hours_per_day = COALESCE($3, hours_per_day),
            hours = COALESCE($4, hours),
            days = COALESCE($5, days),
            working_days = COALESCE($6, working_days),
            hourly_rate = COALESCE($7, hourly_rate),
            total_cost = COALESCE($8, total_cost),
            sort_order = COALESCE($9, sort_order),
            scope_id = COALESCE($10, scope_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      )
      SELECT qt.*, e.name AS employee_name, e.email AS employee_email, e.employee_code,
             COALESCE(qt.role_designation, e.role, e.designation) AS role
      FROM updated qt
      LEFT JOIN "tblEmployees" e ON qt.employee_id = e.id;
    `;
    const result = await this.query(
      sql,
      [
        role_designation,
        technology_skill,
        hours_per_day,
        hours,
        days,
        working_days || days,
        hourly_rate,
        total_cost,
        sort_order,
        scope_id,
        id,
      ],
      client
    );
    return formatTeamMember(result.rows[0]);
  }

  async delete(id, client = null) {
    const sql = `DELETE FROM "tblQuotationTeam" WHERE id = $1 RETURNING *;`;
    const result = await this.query(sql, [id], client);
    return formatTeamMember(result.rows[0]);
  }

  /**
   * Calculate Grand Total of Team Costs for a Quotation
   */
  async calculateQuotationGrandTotal(quotation_id, client = null) {
    const sql = `
      SELECT COALESCE(SUM(total_cost), 0.00) AS grand_total
      FROM "tblQuotationTeam"
      WHERE quotation_id = $1;
    `;
    const result = await this.query(sql, [quotation_id], client);
    return parseFloat(result.rows[0].grand_total);
  }
}

module.exports = new TeamRepository();

