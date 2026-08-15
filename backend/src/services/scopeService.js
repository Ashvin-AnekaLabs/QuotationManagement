const scopeRepository = require('../repositories/scopeRepository');
const quotationRepository = require('../repositories/quotationRepository');
const quotationService = require('./quotationService');
const employeeRepository = require('../repositories/employeeRepository');
const teamRepository = require('../repositories/teamRepository');
const functionalityRepository = require('../repositories/functionalityRepository');
const ApiError = require('../utils/ApiError');

class ScopeService {
  async createScope(quotationId, scopeData) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID ${quotationId} not found`);
    }

    let rate_per_hour = scopeData.rate_per_hour;
    if (rate_per_hour === undefined || rate_per_hour === null || parseFloat(rate_per_hour) === 0) {
      if (quotation.prepared_by_id) {
        const emp = await employeeRepository.findById(quotation.prepared_by_id);
        const empRate = parseFloat(emp?.hourly_rate_value || emp?.hourly_rate || 0);
        if (emp && empRate > 0) {
          rate_per_hour = empRate;
        }
      }
      if (!rate_per_hour || parseFloat(rate_per_hour) === 0) {
        const teamMembers = await teamRepository.findByQuotationId(quotationId);
        if (teamMembers && teamMembers.length > 0 && teamMembers[0].hourly_rate > 0) {
          rate_per_hour = teamMembers[0].hourly_rate;
        }
      }
    }

    const created = await scopeRepository.create({
      ...scopeData,
      rate_per_hour: parseFloat(rate_per_hour || 0),
      quotation_id: quotationId,
    });
    await quotationService.syncQuotationCalculations(quotationId);
    return created;
  }

  async getScopesByQuotationId(quotationId) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID ${quotationId} not found`);
    }
    return await scopeRepository.findByQuotationId(quotationId);
  }

  async getAllScopes(queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 50;
    const offset = (page - 1) * limit;
    return await scopeRepository.findAll({ limit, offset });
  }


  async getScopeById(id) {
    const scope = await scopeRepository.findById(id);
    if (!scope) {
      throw ApiError.notFound(`Scope with ID ${id} not found`);
    }
    return scope;
  }

  async updateScope(id, updateData) {
    const scope = await this.getScopeById(id);
    const updated = await scopeRepository.update(id, updateData);
    await quotationService.syncQuotationCalculations(scope.quotation_id);
    return updated;
  }

  async deleteScope(id) {
    const scope = await this.getScopeById(id);
    const dbClient = await scopeRepository.getTransactionClient();

    try {
      await dbClient.query('BEGIN');
      const deleted = await scopeRepository.delete(id, dbClient);

      // Recalculate quotation total timeline after scope deletion
      await quotationService.syncQuotationCalculations(scope.quotation_id, dbClient);

      await dbClient.query('COMMIT');
      return deleted;
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }
  async syncModules(quotationId, modules) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID ${quotationId} not found`);
    }

    const dbClient = await scopeRepository.getTransactionClient();
    try {
      await dbClient.query('BEGIN');

      // 1. Clear existing data for this quotation
      await dbClient.query(`DELETE FROM "tblQuotationTeam" WHERE quotation_id = $1`, [quotationId]);
      await dbClient.query(`DELETE FROM "tblQuotationFunctionalities" WHERE scope_id IN (SELECT id FROM "tblQuotationScopes" WHERE quotation_id = $1)`, [quotationId]);
      await dbClient.query(`DELETE FROM "tblQuotationScopes" WHERE quotation_id = $1`, [quotationId]);

      // 2. Iterate and Insert new structure
      for (let modIndex = 0; modIndex < modules.length; modIndex++) {
        const mod = modules[modIndex];
        
        // Calculate module effort validation
        const funcEffort = (mod.functionalities || []).reduce((sum, f) => sum + (parseFloat(f.effort) || 0), 0);
        const teamEffort = (mod.teamAllocations || []).reduce((sum, t) => sum + (parseFloat(t.effort) || 0), 0);
        
        const modEffort = (mod.functionalities && mod.functionalities.length > 0) ? funcEffort : teamEffort;
        
        if (teamEffort > modEffort) {
          throw ApiError.badRequest(`Module "${mod.name || 'Untitled'}" has allocated team effort (${teamEffort} Hrs) exceeding total module effort (${modEffort} Hrs). Please reduce team allocated hours.`);
        }

        // Insert Scope (Module)
        const scopeRes = await scopeRepository.create({
          quotation_id: quotationId,
          module: mod.name,
          title: mod.name,
          description: mod.description,
          est_days: parseFloat(mod.durationDays || 0),
          est_hours: modEffort,
          timeline_days: parseInt(mod.durationDays || 0, 10),
          sort_order: modIndex
        }, dbClient);
        
        const scopeId = scopeRes.id;

        // Insert Functionalities
        if (mod.functionalities && mod.functionalities.length > 0) {
          for (let fIndex = 0; fIndex < mod.functionalities.length; fIndex++) {
            const f = mod.functionalities[fIndex];
            await functionalityRepository.create({
              scope_id: scopeId,
              functionality: f.name,
              title: f.name,
              description: f.description,
              est_hours: parseFloat(f.effort || 0),
              est_days: parseFloat(f.duration || 0),
              timeline_days: parseInt(f.duration || 0, 10),
              sort_order: fIndex
            }, dbClient);
          }
        }

        // Insert Team Allocations
        if (mod.teamAllocations && mod.teamAllocations.length > 0) {
          for (let tIndex = 0; tIndex < mod.teamAllocations.length; tIndex++) {
            const t = mod.teamAllocations[tIndex];
            const empId = t.employeeId || null;
            await teamRepository.create({
              quotation_id: quotationId,
              scope_id: scopeId,
              employee_id: empId,
              role_designation: t.role,
              hours: parseFloat(t.effort || 0),
              hourly_rate: parseFloat(t.rate || 0),
              sort_order: tIndex
            }, dbClient);
          }
        }
      }

      await quotationService.syncQuotationCalculations(quotationId, dbClient);

      await dbClient.query('COMMIT');
      return { message: 'Modules synced successfully' };
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }
  async getModulesTree(quotationId) {
    // Fetch all scopes
    const scopes = await scopeRepository.findByQuotationId(quotationId);
    
    // For each scope, fetch functionalities and team
    const modules = [];
    for (const scope of scopes) {
      const functionalities = await functionalityRepository.findByScopeId(scope.id);
      
      const dbClient = await scopeRepository.getTransactionClient();
      let teamAllocations = [];
      try {
        const teamRes = await dbClient.query(`
          SELECT qt.*, e.name AS employee_name, e.email AS employee_email, 
                 COALESCE(qt.role_designation, e.role, e.designation) AS role
          FROM "tblQuotationTeam" qt
          LEFT JOIN "tblEmployees" e ON qt.employee_id = e.id
          WHERE qt.scope_id = $1
          ORDER BY qt.sort_order ASC, qt.id ASC
        `, [scope.id]);
        
        teamAllocations = teamRes.rows.map(t => ({
          id: t.id,
          employeeId: t.employee_id,
          employee_id: t.employee_id,
          name: t.employee_name,
          role: t.role,
          effort: parseFloat(t.hours || 0),
          rate: parseFloat(t.hourly_rate || 0),
          total_cost: parseFloat(t.total_cost || 0)
        }));
      } finally {
        dbClient.release();
      }

      modules.push({
        id: scope.id,
        name: scope.module,
        description: scope.description,
        durationDays: parseFloat(scope.est_days || 0),
        isExpanded: false,
        functionalities: functionalities.map(f => ({
          id: f.id,
          name: f.functionality,
          description: f.description,
          effort: parseFloat(f.est_hours || 0),
          duration: parseFloat(f.est_days || 0)
        })),
        teamAllocations: teamAllocations
      });
    }

    return modules;
  }
}

module.exports = new ScopeService();
