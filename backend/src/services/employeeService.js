// Unused imports removed
const employeeRepository = require('../repositories/employeeRepository');
const ApiError = require('../utils/ApiError');

class EmployeeService {
  async createEmployee(employeeData) {
    const existing = await employeeRepository.findByEmail(employeeData.email);
    if (existing) {
      throw ApiError.conflict(`Employee with email '${employeeData.email}' already exists`);
    }

    // Directly create the Project Team resource (no longer creates system users or sends emails)
    const employee = await employeeRepository.create(employeeData);
    return employee;
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
    
    const dbClient = await employeeRepository.getTransactionClient();
    try {
      // Check if employee is tied to an Admin user
      const userRes = await dbClient.query(`
        SELECT u.id, r.name as role_name FROM "tblUsers" u 
        JOIN "tblRoles" r ON u.role_id = r.id 
        WHERE u.employee_id = $1
      `, [id]);
      
      if (userRes.rows.length > 0 && userRes.rows[0].role_name === 'Admin') {
        // Count active Admins
        const adminCountRes = await dbClient.query(`
          SELECT COUNT(*) as count FROM "tblUsers" u 
          JOIN "tblRoles" r ON u.role_id = r.id 
          WHERE r.name = 'Admin' AND u.is_active = true
        `);
        
        if (parseInt(adminCountRes.rows[0].count, 10) <= 1) {
          throw ApiError.forbidden('Cannot delete the last active Admin account');
        }
      }
    } finally {
      dbClient.release();
    }
    
    return await employeeRepository.delete(id);
  }

  async getDistinctRoles() {
    return await employeeRepository.getDistinctRoles();
  }
}

module.exports = new EmployeeService();
