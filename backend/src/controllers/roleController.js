const { pool } = require('../config/database');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

// GET /api/v1/roles
const getRoles = asyncWrapper(async (req, res) => {
  const sql = `
    SELECT 
      r.id, r.name,
      COUNT(u.id) as user_count
    FROM "tblRoles" r
    LEFT JOIN "tblUsers" u ON r.id = u.role_id
    WHERE r.name != 'Employee'
    GROUP BY r.id
    ORDER BY r.id ASC
  `;
  const result = await pool.query(sql);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result.rows, 'Roles fetched successfully'));
});

// GET /api/v1/roles/:id/privileges
const getRolePrivileges = asyncWrapper(async (req, res) => {
  const roleId = req.params.id;
  const sql = `
    SELECT 
      m.id as module_id, m.code, m.name as module_name,
      COALESCE(p.can_view, false) as can_view,
      COALESCE(p.can_add, false) as can_add,
      COALESCE(p.can_edit, false) as can_edit,
      COALESCE(p.can_delete, false) as can_delete,
      COALESCE(p.can_export, false) as can_export
    FROM "tblModules" m
    LEFT JOIN "tblRolePrivileges" p ON m.id = p.module_id AND p.role_id = $1
    ORDER BY m.id ASC
  `;
  const result = await pool.query(sql, [roleId]);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result.rows, 'Role privileges fetched successfully'));
});

// PUT /api/v1/roles/:id/privileges
const updateRolePrivileges = asyncWrapper(async (req, res) => {
  const roleId = req.params.id;
  const { privileges } = req.body; // Array of { module_id, can_view, can_add, can_edit, can_delete, can_export }

  // Check if role is Admin or Employee
  const roleCheck = await pool.query(`SELECT name FROM "tblRoles" WHERE id = $1`, [roleId]);
  if (roleCheck.rows.length === 0) {
    throw ApiError.notFound('Role not found');
  }
  if (roleCheck.rows[0].name === 'Admin') {
    throw ApiError.forbidden('Admin role privileges cannot be modified');
  }
  if (roleCheck.rows[0].name === 'Employee') {
    throw ApiError.forbidden('Employee role privileges cannot be modified through this API');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const priv of privileges) {
      await client.query(`
        INSERT INTO "tblRolePrivileges" (role_id, module_id, can_view, can_add, can_edit, can_delete, can_export)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (role_id, module_id) DO UPDATE 
        SET can_view = EXCLUDED.can_view,
            can_add = EXCLUDED.can_add,
            can_edit = EXCLUDED.can_edit,
            can_delete = EXCLUDED.can_delete,
            can_export = EXCLUDED.can_export,
            updated_at = CURRENT_TIMESTAMP
      `, [
        roleId, priv.module_id, priv.can_view, priv.can_add, priv.can_edit, priv.can_delete, priv.can_export
      ]);
    }
    
    await client.query('COMMIT');
    res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Role privileges updated successfully'));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

module.exports = {
  getRoles,
  getRolePrivileges,
  updateRolePrivileges,
};
