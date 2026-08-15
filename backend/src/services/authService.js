const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('../config/database');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../utils/emailHelper');

class AuthService {
  /**
   * Helper to generate JWT tokens
   */
  generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role_name },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  async login(email, password) {
    // Fetch user and join role
    const sql = `
      SELECT u.*, r.name AS role_name
      FROM "tblUsers" u
      JOIN "tblRoles" r ON u.role_id = r.id
      WHERE LOWER(u.email) = LOWER($1);
    `;
    const result = await pool.query(sql, [email]);
    const user = result.rows[0];

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.is_active) {
      throw ApiError.unauthorized('Your account is inactive. Please contact the administrator.');
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    // Save refresh token Directly in tblUsers
    const expiresDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '7d', 10) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    await pool.query(
      `UPDATE "tblUsers"
       SET refresh_token = $1,
           refresh_token_expires_at = $2,
           last_login_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3;`,
      [refreshToken, expiresAt, user.id]
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role_name,
        employee_id: user.employee_id,
      },
      accessToken,
      refreshToken,
      mustChangePassword: user.must_change_password,
    };
  }

  async refreshToken(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Check DB record on tblUsers directly
    const result = await pool.query(
      `SELECT u.id, u.email, r.name AS role_name, u.is_active
       FROM "tblUsers" u
       JOIN "tblRoles" r ON u.role_id = r.id
       WHERE u.refresh_token = $1 AND u.refresh_token_expires_at > CURRENT_TIMESTAMP;`,
      [token]
    );
    const user = result.rows[0];
    if (!user) {
      throw ApiError.unauthorized('Refresh token is expired, invalid, or revoked');
    }

    if (!user.is_active) {
      throw ApiError.unauthorized('User session is no longer active');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role_name },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    return { accessToken };
  }

  async logout(token) {
    await pool.query(
      `UPDATE "tblUsers"
       SET refresh_token = NULL,
           refresh_token_expires_at = NULL
       WHERE refresh_token = $1;`,
      [token]
    );
    return true;
  }

  async forgotPassword(email) {
    // 1. Fetch user
    const result = await pool.query('SELECT id, email FROM "tblUsers" WHERE LOWER(email) = LOWER($1);', [email]);
    const user = result.rows[0];

    // Note: Do not throw error or reveal if the email is not registered.
    if (!user) {
      return { message: 'If the account exists, a password reset link has been sent.' };
    }

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Valid for 1 hour

    // Save token directly in tblUsers
    await pool.query(
      `UPDATE "tblUsers"
       SET reset_token = $1,
           reset_token_expires_at = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3;`,
      [token, expiresAt, user.id]
    );

    // 3. Send Email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const mailText = `You requested a password reset. Please click on the link to reset your password: ${resetLink}. This link is valid for 1 hour.`;
    const mailHtml = `
      <h3>Password Reset Request</h3>
      <p>We received a request to reset your password.</p>
      <p>Please click on the button below to reset your password. This link is valid for 1 hour:</p>
      <div style="margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - QuoteMaster',
      text: mailText,
      html: mailHtml,
    });

    return { message: 'If the account exists, a password reset link has been sent.' };
  }

  async resetPassword(token, newPassword) {
    // 1. Validate token directly in tblUsers
    const result = await pool.query(
      'SELECT id FROM "tblUsers" WHERE reset_token = $1 AND reset_token_expires_at > CURRENT_TIMESTAMP;',
      [token]
    );
    const user = result.rows[0];
    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    // 2. Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password, clear reset/refresh token fields
    await pool.query(
      `UPDATE "tblUsers"
       SET password_hash = $1,
           must_change_password = FALSE,
           refresh_token = NULL,
           refresh_token_expires_at = NULL,
           reset_token = NULL,
           reset_token_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2;`,
      [passwordHash, user.id]
    );

    return true;
  }

  async changePassword(userId, currentPassword, newPassword) {
    // 1. Fetch user
    const result = await pool.query('SELECT * FROM "tblUsers" WHERE id = $1;', [userId]);
    const user = result.rows[0];
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw ApiError.badRequest('Incorrect current password');
    }

    // 3. Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password, clear refresh tokens
    await pool.query(
      `UPDATE "tblUsers"
       SET password_hash = $1,
           must_change_password = FALSE,
           refresh_token = NULL,
           refresh_token_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2;`,
      [passwordHash, userId]
    );

    return true;
  }
}

module.exports = new AuthService();
