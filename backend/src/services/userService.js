const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/emailHelper');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

function generateSecurePassword(length = 8) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^*()_+-=[]{}:;?,.';  // No <, >, &, `, |, ~, ', " — these break in HTML emails
  const allChars = uppercase + lowercase + digits + special;

  let password = '';
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += special[crypto.randomInt(0, special.length)];
  password += digits[crypto.randomInt(0, digits.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Secure shuffle using Fisher-Yates with crypto.randomInt
  const arr = password.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

class UserService {
  async createUser(currentUser, userData) {
    // 1. Check duplicate email
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) {
      throw ApiError.conflict(`User with email '${userData.email}' already exists`);
    }

    // 2. Hierarchy Logic
    let reportingManagerId = userData.reporting_manager_id;
    
    // Validate role exists
    const roleId = userData.role_id;
    // We should ideally fetch role name to know what they are creating, but we can trust role_id if we fetch it
    // Wait, let's just fetch the role being assigned to ensure logic
    const dbClient = await userRepository.getTransactionClient();
    try {
      await dbClient.query('BEGIN');

      const roleRes = await dbClient.query('SELECT name FROM "tblRoles" WHERE id = $1', [roleId]);
      if (roleRes.rows.length === 0) {
        throw ApiError.badRequest('Invalid role ID provided');
      }
      const roleName = roleRes.rows[0].name;

      if (roleName !== 'Manager' && roleName !== 'Sales Person') {
        throw ApiError.forbidden(`Cannot create users with role: ${roleName}`);
      }

      if (currentUser.role === 'Admin') {
        if (roleName === 'Sales Person') {
          if (!reportingManagerId) {
            throw ApiError.badRequest('Admin must select a reporting manager when creating a Sales Executive');
          }
          // Verify the selected manager is actually a Manager
          const mgr = await userRepository.findById(reportingManagerId, dbClient);
          if (!mgr || mgr.role !== 'Manager' || !mgr.is_active) {
            throw ApiError.badRequest('Selected reporting manager is invalid or inactive');
          }
        } else if (roleName === 'Manager') {
          // Managers can report to Admin or be null
          // If no manager selected, default to Admin (or null)
          if (!reportingManagerId) {
            reportingManagerId = currentUser.id || null;
          }
        }
      } else if (currentUser.role === 'Manager') {
        if (roleName !== 'Sales Person') {
          throw ApiError.forbidden('Managers can only create Sales Executives');
        }
        // Force the reporting manager to be the logged-in Manager
        reportingManagerId = currentUser.userId;
      }

      // 3. Generate credentials matching policy (6-10 chars, 1 upper, 1 lower, 1 special)
      const tempPassword = generateSecurePassword(8);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // 4. Create user
      const newUser = await userRepository.create({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        passwordHash,
        roleId,
        reportingManagerId
      }, dbClient);

      await dbClient.query('COMMIT');

      // 5. Send Welcome Email
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const loginUrl = `${frontendUrl}/login`;
      const displayRole = roleName === 'Sales Person' ? 'Sales Executive' : roleName;
      const mailText = `Welcome to QuoteMaster!\n\nA ${displayRole} account has been created for you.\nName: ${userData.name}\nUsername: ${userData.email}\nTemporary Password: ${tempPassword}\n\nPlease login at ${loginUrl} and change your password immediately.`;
      const mailHtml = `
        <h3>Welcome to QuoteMaster!</h3>
        <p>A <strong>${displayRole}</strong> account has been created for you.</p>
        <p><strong>Name:</strong> ${userData.name}</p>
        <p><strong>Username / Email:</strong> ${userData.email}</p>
        <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
        <p>Please login to the application using the link below and change your password immediately for security:</p>
        <div style="margin: 20px 0;">
          <a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Log In to Application</a>
        </div>
      `;

      // Do not await email sending to avoid blocking response on SMTP lag
      sendEmail({
        to: userData.email,
        subject: 'Welcome to QuoteMaster - Your Login Credentials',
        text: mailText,
        html: mailHtml,
      }).catch(err => console.error('Failed to send welcome email:', err));

      return await userRepository.findById(newUser.id);
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }

  async getAllUsers(currentUser, queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 50;

    const filters = {
      page,
      limit,
      currentUserId: currentUser.userId,
      currentUserRole: currentUser.role
    };

    const { users, total } = await userRepository.findAll(filters);
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getManagers() {
    return await userRepository.getActiveManagers();
  }

  async getUserById(id, currentUser) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound(`User not found`);
    }

    // RBAC Check
    if (currentUser.role === 'Manager') {
      if (user.id !== currentUser.userId && user.reporting_manager_id !== currentUser.userId) {
        throw ApiError.forbidden('You do not have permission to view this user');
      }
    }

    return user;
  }

  async updateUser(id, currentUser, updateData) {
    const existing = await this.getUserById(id, currentUser); // This also handles RBAC view check

    if (updateData.email) {
      const emailCheck = await userRepository.findByEmail(updateData.email);
      if (emailCheck && emailCheck.id !== parseInt(id, 10)) {
        throw ApiError.conflict(`Email '${updateData.email}' is already used by another user`);
      }
    }

    const dbClient = await userRepository.getTransactionClient();
    try {
      await dbClient.query('BEGIN');

      // Admin role protection
      if (existing.role === 'Admin') {
        // Prevent deactivating or changing role of the last active Admin
        if (updateData.is_active === false || (updateData.role_id && updateData.role_id !== existing.role_id)) {
          const adminCount = await userRepository.countActiveAdmins(dbClient);
          if (adminCount <= 1 && existing.is_active) {
            throw ApiError.forbidden('Cannot deactivate or change the role of the last active Admin account');
          }
        }
      }

      // Hierarchy rules for update
      let reportingManagerId = updateData.reporting_manager_id !== undefined ? updateData.reporting_manager_id : existing.reporting_manager_id;
      
      if (reportingManagerId == id) {
        throw ApiError.badRequest('A user cannot report to themselves');
      }

      if (currentUser.role === 'Manager') {
        if (id !== currentUser.userId) {
          // Manager updating their Sales Exec
          // They cannot change the reporting manager to someone else
          if (updateData.reporting_manager_id && updateData.reporting_manager_id !== currentUser.userId) {
            throw ApiError.forbidden('You cannot reassign this user to another manager');
          }
        }
      } else if (currentUser.role === 'Admin' && reportingManagerId) {
         const mgr = await userRepository.findById(reportingManagerId, dbClient);
         if (!mgr || mgr.role !== 'Manager' || !mgr.is_active) {
           throw ApiError.badRequest('Selected reporting manager is invalid or inactive');
         }
      }

      await userRepository.update(id, {
        name: updateData.name,
        phone: updateData.phone,
        email: updateData.email,
        roleId: updateData.role_id,
        reportingManagerId,
        is_active: updateData.is_active
      }, dbClient);

      await dbClient.query('COMMIT');
      return await userRepository.findById(id);
    } catch(err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }

  async deleteUser(id, currentUser) {
    const existing = await this.getUserById(id, currentUser); // RBAC covered

    if (existing.role === 'Admin') {
      const adminCount = await userRepository.countActiveAdmins();
      if (adminCount <= 1 && existing.is_active) {
        throw ApiError.forbidden('Cannot deactivate the last active Admin account');
      }
    }

    if (existing.role === 'Manager') {
      const subordinateCount = await userRepository.countSubordinates(id);
      if (subordinateCount > 0) {
        throw ApiError.conflict('Cannot deactivate this Manager because they have active Sales Executives reporting to them. Reassign them first.');
      }
    }

    // Soft delete
    await userRepository.update(id, { is_active: false, deleted_at: new Date() });
    return { message: 'User deleted successfully' };
  }
}

module.exports = new UserService();
