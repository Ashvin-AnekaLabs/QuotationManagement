const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const ApiError = require('../utils/ApiError');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Access token is missing or invalid'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Access token has expired'));
      }
      return next(ApiError.unauthorized('Invalid access token'));
    }

    // Fetch user from DB with role name
    const sql = `
      SELECT u.id, u.email, u.employee_id, u.is_active, u.must_change_password, r.name AS role_name
      FROM "tblUsers" u
      JOIN "tblRoles" r ON u.role_id = r.id
      WHERE u.id = $1;
    `;
    const result = await pool.query(sql, [decoded.userId]);
    const user = result.rows[0];

    if (!user) {
      return next(ApiError.unauthorized('Authenticated user no longer exists'));
    }

    if (!user.is_active) {
      return next(ApiError.unauthorized('User account has been deactivated'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role_name,
      employee_id: user.employee_id,
      must_change_password: user.must_change_password,
      privileges: {},
    };

    // Fetch privileges
    if (user.role_name === 'Admin') {
      // Admin bypasses all checks programmatically, but we can set a flag or just let permissionMiddleware handle it
      req.user.isAdmin = true;
    } else {
      req.user.isAdmin = false;
      const privSql = `
        SELECT m.code, p.can_view, p.can_add, p.can_edit, p.can_delete, p.can_export
        FROM "tblRolePrivileges" p
        JOIN "tblModules" m ON p.module_id = m.id
        JOIN "tblRoles" r ON p.role_id = r.id
        WHERE r.name = $1;
      `;
      const privRes = await pool.query(privSql, [user.role_name]);
      privRes.rows.forEach(row => {
        req.user.privileges[row.code] = {
          can_view: row.can_view,
          can_add: row.can_add,
          can_edit: row.can_edit,
          can_delete: row.can_delete,
          can_export: row.can_export
        };
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;
