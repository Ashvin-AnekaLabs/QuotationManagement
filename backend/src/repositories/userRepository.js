const BaseRepository = require('./baseRepository');

class UserRepository extends BaseRepository {
  
  formatUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name || (row.emp_name || ''),
      phone: row.phone || (row.emp_phone || ''),
      email: row.email,
      role: row.role_name,
      role_id: row.role_id,
      is_active: row.is_active,
      reporting_manager_id: row.reporting_manager_id,
      reporting_manager_name: row.manager_name || 'N/A',
      created_at: row.created_at
    };
  }

  async create({ name, phone, email, passwordHash, roleId, reportingManagerId }, client = null) {
    const sql = `
      INSERT INTO "tblUsers" (name, phone, email, password_hash, role_id, reporting_manager_id, is_active, must_change_password)
      VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)
      RETURNING id, name, phone, email, role_id, reporting_manager_id, is_active, created_at;
    `;
    const result = await this.query(
      sql, 
      [name, phone, email, passwordHash, roleId, reportingManagerId], 
      client
    );
    return result.rows[0]; // Raw return, format via getById
  }

  async findAll(filters = {}, client = null) {
    const { page = 1, limit = 50, currentUserId, currentUserRole } = filters;
    const offset = (page - 1) * limit;

    let whereClause = `u.deleted_at IS NULL`;
    let params = [];
    let paramIndex = 1;

    // RBAC Scoping
    if (currentUserRole === 'Manager') {
      whereClause += ` AND (u.id = $${paramIndex} OR u.reporting_manager_id = $${paramIndex})`;
      params.push(currentUserId);
      paramIndex++;
    }

    const sql = `
      SELECT 
        u.id, u.name, u.phone, u.email, u.role_id, u.is_active, u.reporting_manager_id, u.created_at,
        r.name AS role_name,
        m.name AS manager_name,
        e.name AS emp_name, e.phone AS emp_phone
      FROM "tblUsers" u
      JOIN "tblRoles" r ON u.role_id = r.id
      LEFT JOIN "tblUsers" m ON u.reporting_manager_id = m.id
      LEFT JOIN "tblEmployees" e ON u.employee_id = e.id
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const countSql = `
      SELECT COUNT(*) 
      FROM "tblUsers" u 
      WHERE ${whereClause}
    `;

    params.push(limit, offset);

    const [dataRes, countRes] = await Promise.all([
      this.query(sql, params, client),
      this.query(countSql, params.slice(0, paramIndex - 1), client) // Exclude limit/offset for count
    ]);

    return {
      users: dataRes.rows.map(row => this.formatUser(row)),
      total: parseInt(countRes.rows[0].count, 10),
    };
  }

  async findById(id, client = null) {
    const sql = `
      SELECT 
        u.id, u.name, u.phone, u.email, u.role_id, u.is_active, u.reporting_manager_id, u.created_at,
        r.name AS role_name,
        m.name AS manager_name,
        e.name AS emp_name, e.phone AS emp_phone
      FROM "tblUsers" u
      JOIN "tblRoles" r ON u.role_id = r.id
      LEFT JOIN "tblUsers" m ON u.reporting_manager_id = m.id
      LEFT JOIN "tblEmployees" e ON u.employee_id = e.id
      WHERE u.id = $1 AND u.deleted_at IS NULL;
    `;
    const result = await this.query(sql, [id], client);
    return this.formatUser(result.rows[0]);
  }

  async findByEmail(email, client = null) {
    const sql = `SELECT * FROM "tblUsers" WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL;`;
    const result = await this.query(sql, [email], client);
    return result.rows[0]; // Raw for checks
  }

  async update(id, updateData, client = null) {
    const { name, phone, email, roleId, reportingManagerId, is_active } = updateData;
    const sql = `
      UPDATE "tblUsers"
      SET 
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        role_id = COALESCE($4, role_id),
        reporting_manager_id = $5,
        is_active = COALESCE($6, is_active),
        deleted_at = COALESCE($7, deleted_at),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *;
    `;
    // We allow reporting_manager_id to be NULL if intentionally passed, but for simplicity here we assume $5 is handled explicitly in service
    const result = await this.query(
      sql,
      [name, phone, email, roleId, reportingManagerId !== undefined ? reportingManagerId : null, is_active, updateData.deleted_at, id],
      client
    );
    return result.rows[0];
  }

  async getActiveManagers(client = null) {
    const sql = `
      SELECT 
        u.id, u.name, u.phone, u.email,
        e.name AS emp_name, e.phone AS emp_phone
      FROM "tblUsers" u
      JOIN "tblRoles" r ON u.role_id = r.id
      LEFT JOIN "tblEmployees" e ON u.employee_id = e.id
      WHERE r.name = 'Manager' AND u.is_active = true AND u.deleted_at IS NULL
      ORDER BY u.created_at DESC;
    `;
    const result = await this.query(sql, [], client);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name || (row.emp_name || ''),
      phone: row.phone || (row.emp_phone || ''),
      email: row.email
    }));
  }
  
  async getRoleByName(name, client = null) {
    const sql = `SELECT id FROM "tblRoles" WHERE name = $1`;
    const result = await this.query(sql, [name], client);
    return result.rows[0];
  }

  async countSubordinates(managerId, client = null) {
    const sql = `SELECT COUNT(*) FROM "tblUsers" WHERE reporting_manager_id = $1 AND is_active = true`;
    const result = await this.query(sql, [managerId], client);
    return parseInt(result.rows[0].count, 10);
  }
  
  async countActiveAdmins(client = null) {
    const sql = `
      SELECT COUNT(*) as count 
      FROM "tblUsers" u 
      JOIN "tblRoles" r ON u.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    `;
    const result = await this.query(sql, [], client);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = new UserRepository();
