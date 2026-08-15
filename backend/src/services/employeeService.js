const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/emailHelper');
const employeeRepository = require('../repositories/employeeRepository');
const ApiError = require('../utils/ApiError');

class EmployeeService {
  async createEmployee(employeeData) {
    const existing = await employeeRepository.findByEmail(employeeData.email);
    if (existing) {
      throw ApiError.conflict(`Employee with email '${employeeData.email}' already exists`);
    }

    const dbClient = await employeeRepository.getTransactionClient();
    try {
      await dbClient.query('BEGIN');

      // 1. Create the employee record
      const employee = await employeeRepository.create(employeeData, dbClient);

      // 2. Generate secure random 12-char temporary password
      const tempPassword = crypto.randomBytes(6).toString('hex');

      // 3. Hash temporary password
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // 4. Fetch the 'Employee' role ID
      const roleRes = await dbClient.query('SELECT id FROM "tblRoles" WHERE name = $1;', ['Employee']);
      if (roleRes.rows.length === 0) {
        throw ApiError.internal('Employee role does not exist in Role Master');
      }
      const employeeRoleId = roleRes.rows[0].id;

      // 5. Create user master record in "tblUsers"
      await dbClient.query(
        `INSERT INTO "tblUsers" (employee_id, role_id, email, password_hash, is_active, must_change_password)
         VALUES ($1, $2, $3, $4, TRUE, TRUE);`,
        [employee.id, employeeRoleId, employee.email, passwordHash]
      );

      await dbClient.query('COMMIT');

      // 6. Send welcome email asynchronously
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const loginUrl = `${frontendUrl}/login`;
      const mailText = `Welcome to QuoteMaster!\n\nYour account has been created.\nUsername: ${employee.email}\nTemporary Password: ${tempPassword}\n\nPlease login at ${loginUrl} and change your password immediately.`;
      const mailHtml = `
        <h3>Welcome to QuoteMaster!</h3>
        <p>An account has been created for you as an Employee.</p>
        <p><strong>Username / Email:</strong> ${employee.email}</p>
        <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
        <p>Please login to the application using the link below and change your password immediately for security:</p>
        <div style="margin: 20px 0;">
          <a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Log In to Application</a>
        </div>
      `;

      sendEmail({
        to: employee.email,
        subject: 'Welcome to QuoteMaster - Your Login Credentials',
        text: mailText,
        html: mailHtml,
      });

      return employee;
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }

  async getAllEmployees(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const { employees, total } = await employeeRepository.findAll({ limit, offset });
    return {
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeById(id) {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw ApiError.notFound(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async updateEmployee(id, updateData) {
    await this.getEmployeeById(id);

    if (updateData.email) {
      const existing = await employeeRepository.findByEmail(updateData.email);
      if (existing && existing.id !== parseInt(id, 10)) {
        throw ApiError.conflict(`Email '${updateData.email}' is already used by another employee`);
      }
    }

    return await employeeRepository.update(id, updateData);
  }

  async deleteEmployee(id) {
    await this.getEmployeeById(id);
    return await employeeRepository.delete(id);
  }
}

module.exports = new EmployeeService();
