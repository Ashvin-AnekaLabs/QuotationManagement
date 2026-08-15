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
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;
