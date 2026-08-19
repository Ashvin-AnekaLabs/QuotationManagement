const BaseRepository = require('./baseRepository');
const { formatCurrency } = require('../helpers/quotationHelper');

const formatEmployee = (emp) => {
  if (!emp) return null;
  const roleName = emp.role || emp.designation || '';
  const rateValue = parseFloat(emp.hourly_rate || 0);
  return {
    ...emp,
    role: roleName,
    designation: roleName,
    department: emp.department || '',
    hourly_rate: `₹${rateValue.toFixed(2)}`,
    hourly_rate_value: rateValue,
    hourly_rate_formatted: formatCurrency(emp.hourly_rate),
  };
};

class EmployeeRepository extends BaseRepository {
  async create({ employee_code, name, email, phone, role, designation, department, hourly_rate, assigned_project }, client = null) {
    const actualRole = role || designation || '';
    const sql = `
      INSERT INTO "tblEmployees" (employee_code, name, email, phone, role, designation, department, hourly_rate, assigned_project)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [employee_code, name, email, phone, actualRole, actualRole, department || null, hourly_rate, assigned_project],
      client
    );
    return formatEmployee(result.rows[0]);
  }

  async findAll({ limit = 50, offset = 0 } = {}, client = null) {
    const sql = `
      SELECT * FROM "tblEmployees"
      ORDER BY id DESC
      LIMIT $1 OFFSET $2;
    `;
    const countSql = `SELECT COUNT(*) FROM "tblEmployees";`;
    const [dataRes, countRes] = await Promise.all([
      this.query(sql, [limit, offset], client),
      this.query(countSql, [], client),
    ]);
    return {
      employees: dataRes.rows.map(formatEmployee),
      total: parseInt(countRes.rows[0].count, 10),
    };
  }

  async findById(id, client = null) {
    const sql = `SELECT * FROM "tblEmployees" WHERE id = $1;`;
    const result = await this.query(sql, [id], client);
    return formatEmployee(result.rows[0]);
  }

  async findByEmail(email, client = null) {
    const sql = `SELECT * FROM "tblEmployees" WHERE email = $1;`;
    const result = await this.query(sql, [email], client);
    return formatEmployee(result.rows[0]);
  }

  async update(id, { employee_code, name, email, phone, role, designation, department, hourly_rate, assigned_project }, client = null) {
    const actualRole = role || designation;
    const sql = `
      UPDATE "tblEmployees"
      SET employee_code = COALESCE($1, employee_code),
          name = COALESCE($2, name),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          role = COALESCE($5, role),
          designation = COALESCE($6, designation),
          department = COALESCE($7, department),
          hourly_rate = COALESCE($8, hourly_rate),
          assigned_project = COALESCE($9, assigned_project),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [employee_code, name, email, phone, actualRole, actualRole, department, hourly_rate, assigned_project, id],
      client
    );
    return formatEmployee(result.rows[0]);
  }

  async delete(id, client = null) {
    const sql = `DELETE FROM "tblEmployees" WHERE id = $1 RETURNING *;`;
    const result = await this.query(sql, [id], client);
    return formatEmployee(result.rows[0]);
  }

  async getDistinctRoles(client = null) {
    const sql = `
      SELECT DISTINCT TRIM(role) AS role
      FROM "tblEmployees"
      WHERE role IS NOT NULL AND TRIM(role) <> ''
      ORDER BY role ASC;
    `;
    const result = await this.query(sql, [], client);
    return result.rows.map((r) => r.role);
  }
}

module.exports = new EmployeeRepository();
