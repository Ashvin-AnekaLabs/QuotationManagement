const milestoneRepository = require('../repositories/milestoneRepository');
const quotationRepository = require('../repositories/quotationRepository');
const ApiError = require('../utils/ApiError');
const HTTP_STATUS = require('../constants/statusCodes');

class MilestoneService {
  async createMilestone(data) {
    const quotation = await quotationRepository.findById(data.quotation_id);
    if (!quotation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Quotation with ID ${data.quotation_id} not found`);
    }
    return await milestoneRepository.create(data);
  }

  async getMilestonesByQuotationId(quotationId) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Quotation with ID ${quotationId} not found`);
    }
    return await milestoneRepository.findByQuotationId(quotationId);
  }

  async getMilestoneById(id) {
    const milestone = await milestoneRepository.findById(id);
    if (!milestone) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Milestone with ID ${id} not found`);
    }
    return milestone;
  }

  async updateMilestone(id, data) {
    const milestone = await milestoneRepository.findById(id);
    if (!milestone) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Milestone with ID ${id} not found`);
    }
    return await milestoneRepository.update(id, data);
  }

  async deleteMilestone(id) {
    const milestone = await milestoneRepository.findById(id);
    if (!milestone) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Milestone with ID ${id} not found`);
    }
    return await milestoneRepository.delete(id);
  }

  async bulkSaveMilestones(quotationId, milestones) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Quotation with ID ${quotationId} not found`);
    }
    return await milestoneRepository.bulkSave(quotationId, milestones);
  }
}

module.exports = new MilestoneService();
