const functionalityRepository = require('../repositories/functionalityRepository');
const scopeRepository = require('../repositories/scopeRepository');
const quotationService = require('./quotationService');
const ApiError = require('../utils/ApiError');

class FunctionalityService {
  async createFunctionality(scopeId, funcData) {
    const scope = await scopeRepository.findById(scopeId);
    if (!scope) {
      throw ApiError.notFound(`Scope with ID ${scopeId} not found`);
    }

    const dbClient = await functionalityRepository.getTransactionClient();
    try {
      await dbClient.query('BEGIN');

      const functionality = await functionalityRepository.create(
        {
          scope_id: scopeId,
          module: funcData.module || funcData.module_name || '',
          title: funcData.title || funcData.functionality || '',
          functionality: funcData.functionality || funcData.title || '',
          timeline_days: funcData.timeline_days,
        },
        dbClient
      );

      // Recalculate quotation timeline
      await quotationService.syncQuotationCalculations(scope.quotation_id, dbClient);

      await dbClient.query('COMMIT');
      return functionality;
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }

  async getFunctionalitiesByScopeId(scopeId) {
    const scope = await scopeRepository.findById(scopeId);
    if (!scope) {
      throw ApiError.notFound(`Scope with ID ${scopeId} not found`);
    }
    return await functionalityRepository.findByScopeId(scopeId);
  }

  async getAllFunctionalities(queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 50;
    const offset = (page - 1) * limit;
    return await functionalityRepository.findAll({ limit, offset });
  }


  async getFunctionalityById(id) {
    const func = await functionalityRepository.findById(id);
    if (!func) {
      throw ApiError.notFound(`Functionality with ID ${id} not found`);
    }
    return func;
  }

  async updateFunctionality(id, updateData) {
    const existing = await this.getFunctionalityById(id);
    const dbClient = await functionalityRepository.getTransactionClient();

    try {
      await dbClient.query('BEGIN');

      const updated = await functionalityRepository.update(id, updateData, dbClient);

      // If timeline_days changed, sync calculations
      if (updateData.timeline_days !== undefined) {
        await quotationService.syncQuotationCalculations(existing.quotation_id, dbClient);
      }

      await dbClient.query('COMMIT');
      return updated;
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }

  async deleteFunctionality(id) {
    const existing = await this.getFunctionalityById(id);
    const dbClient = await functionalityRepository.getTransactionClient();

    try {
      await dbClient.query('BEGIN');

      const deleted = await functionalityRepository.delete(id, dbClient);
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

module.exports = new FunctionalityService();
