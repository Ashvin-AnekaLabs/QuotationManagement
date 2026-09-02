const followUpRepository = require('../repositories/followUpRepository');
const quotationRepository = require('../repositories/quotationRepository');
const ApiError = require('../utils/ApiError');

class FollowUpService {
  async addFollowUp(quotationId, followUpData) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID ${quotationId} not found`);
    }

    const newFollowUp = await followUpRepository.create({
      ...followUpData,
      quotation_id: quotationId
    });

    return newFollowUp;
  }

  async getFollowUps(quotationId) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID ${quotationId} not found`);
    }

    const followUps = await followUpRepository.findByQuotationId(quotationId);
    return followUps;
  }

  async updateQuotationStatus(quotationId, status, status_reason) {
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw ApiError.notFound(`Quotation with ID ${quotationId} not found`);
    }

    // Since our update method in quotationRepository handles specific fields, 
    // we need to make sure status and status_reason are allowed. 
    // Wait, update method has an allowedFields list! Let's check it.
    // I will add status and status_reason to allowedFields in the repository via another change.
    const updatedQuotation = await quotationRepository.update(quotationId, {
      status,
      status_reason
    });

    return updatedQuotation;
  }
}

module.exports = new FollowUpService();
