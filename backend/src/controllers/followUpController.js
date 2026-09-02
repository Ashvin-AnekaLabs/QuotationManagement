const followUpService = require('../services/followUpService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const addFollowUp = asyncWrapper(async (req, res) => {
  const followUp = await followUpService.addFollowUp(req.params.quotationId, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, followUp, 'Follow-up created successfully'));
});

const getFollowUps = asyncWrapper(async (req, res) => {
  const followUps = await followUpService.getFollowUps(req.params.quotationId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, followUps, 'Follow-ups fetched successfully'));
});

const updateQuotationStatus = asyncWrapper(async (req, res) => {
  const { status, status_reason } = req.body;
  const quotation = await followUpService.updateQuotationStatus(req.params.quotationId, status, status_reason);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, quotation, 'Quotation status updated successfully'));
});

module.exports = {
  addFollowUp,
  getFollowUps,
  updateQuotationStatus,
};
