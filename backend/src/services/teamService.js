const teamRepository = require('../repositories/teamRepository');
const quotationRepository = require('../repositories/quotationRepository');
const employeeRepository = require('../repositories/employeeRepository');
const quotationService = require('./quotationService');
const { calculateEmployeeCost } = require('../helpers/quotationHelper');
const ApiError = require('../utils/ApiError');

class TeamService {
  async assignTeamMember(quotationId, teamData) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID ${quotationId} not found`);
    }

    const employee = await employeeRepository.findById(teamData.employee_id);
    if (!employee) {
      throw ApiError.notFound(`Employee with ID ${teamData.employee_id} not found`);
    }

    const existingAssignment = await teamRepository.findByQuotationAndEmployee(
      quotationId,
      teamData.employee_id
    );
    if (existingAssignment) {
      throw ApiError.conflict(
        `Employee '${employee.name}' is already assigned to this quotation`
      );
    }

    const hourly_rate = (teamData.hourly_rate !== undefined && teamData.hourly_rate !== null)
      ? parseFloat(teamData.hourly_rate)
      : parseFloat(employee.hourly_rate_value || employee.hourly_rate || 0);

    const role_designation = teamData.role_designation || employee.role || employee.designation || '';
    const technology_skill = teamData.technology_skill || employee.assigned_project || '';

    const inputDays = parseFloat(teamData.days || teamData.working_days || 0);
    const inputHours = parseFloat(teamData.hours || 0);
    const inputHoursPerDay = parseFloat(teamData.hours_per_day || 8);

    const computedDays = inputDays || (inputHours > 0 ? Math.ceil(inputHours / inputHoursPerDay) : 0);
    const computedHours = inputHours || (computedDays * inputHoursPerDay);
    const computedHoursPerDay = inputHoursPerDay || (computedDays > 0 ? (computedHours / computedDays) : 8);

    const total_cost = teamData.total_cost !== undefined
      ? parseFloat(teamData.total_cost)
      : (computedHours * hourly_rate);

    const dbClient = await teamRepository.getTransactionClient();
    try {
      await dbClient.query('BEGIN');

      const assignment = await teamRepository.create(
        {
          quotation_id: quotationId,
          employee_id: teamData.employee_id,
          role_designation,
          technology_skill,
          hours: computedHours,
          days: computedDays,
          hours_per_day: computedHoursPerDay,
          working_days: computedDays,
          hourly_rate,
          total_cost,
        },
        dbClient
      );

      // Recalculate quotation grand total
      await quotationService.syncQuotationCalculations(quotationId, dbClient);

      await dbClient.query('COMMIT');
      return assignment;
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }

  async getTeamByQuotationId(quotationId) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID ${quotationId} not found`);
    }
    return await teamRepository.findByQuotationId(quotationId);
  }

  async getTeamMemberById(id) {
    const member = await teamRepository.findById(id);
    if (!member) {
      throw ApiError.notFound(`Team assignment with ID ${id} not found`);
    }
    return member;
  }

  async updateTeamMember(id, updateData) {
    const existing = await this.getTeamMemberById(id);

    const role_designation = updateData.role_designation || existing.role_designation;
    const technology_skill = updateData.technology_skill || existing.technology_skill;
    const hourly_rate = updateData.hourly_rate !== undefined ? parseFloat(updateData.hourly_rate) : existing.hourly_rate;

    const inputDays = updateData.days !== undefined ? parseFloat(updateData.days) : (updateData.working_days !== undefined ? parseFloat(updateData.working_days) : existing.days);
    const inputHours = updateData.hours !== undefined ? parseFloat(updateData.hours) : existing.hours;
    const inputHoursPerDay = updateData.hours_per_day !== undefined ? parseFloat(updateData.hours_per_day) : existing.hours_per_day;

    const computedDays = inputDays || (inputHours > 0 ? Math.ceil(inputHours / (inputHoursPerDay || 8)) : 0);
    const computedHours = inputHours || (computedDays * (inputHoursPerDay || 8));
    const computedHoursPerDay = inputHoursPerDay || (computedDays > 0 ? (computedHours / computedDays) : 8);
    const total_cost = updateData.total_cost !== undefined ? parseFloat(updateData.total_cost) : (computedHours * hourly_rate);

    const dbClient = await teamRepository.getTransactionClient();
    try {
      await dbClient.query('BEGIN');

      const updated = await teamRepository.update(
        id,
        {
          role_designation,
          technology_skill,
          hours: computedHours,
          days: computedDays,
          hours_per_day: computedHoursPerDay,
          working_days: computedDays,
          hourly_rate,
          total_cost,
        },
        dbClient
      );

      await quotationService.syncQuotationCalculations(existing.quotation_id, dbClient);

      await dbClient.query('COMMIT');
      return updated;
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }

  async removeTeamMember(id) {
    const existing = await this.getTeamMemberById(id);
    const dbClient = await teamRepository.getTransactionClient();

    try {
      await dbClient.query('BEGIN');

      const deleted = await teamRepository.delete(id, dbClient);
      await quotationService.syncQuotationCalculations(existing.quotation_id, dbClient);

      await dbClient.query('COMMIT');
      return deleted;
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }
}

module.exports = new TeamService();
