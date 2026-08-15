const milestoneService = require('../services/milestoneService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createMilestone = asyncWrapper(async (req, res) => {
  const quotation_id = req.body.quotation_id || (req.params.quotationId ? parseInt(req.params.quotationId, 10) : undefined);
  if (!quotation_id) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(new ApiResponse(HTTP_STATUS.BAD_REQUEST, null, 'Quotation ID is required'));
  }

  const milestone = await milestoneService.createMilestone({
    ...req.body,
    quotation_id,
  });
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, milestone, 'Milestone created successfully'));
});


const getMilestonesByQuotation = asyncWrapper(async (req, res) => {
  const milestones = await milestoneService.getMilestonesByQuotationId(req.params.quotationId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, milestones, 'Milestones fetched successfully'));
});

const updateMilestone = asyncWrapper(async (req, res) => {
  const milestone = await milestoneService.updateMilestone(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, milestone, 'Milestone updated successfully'));
});

const deleteMilestone = asyncWrapper(async (req, res) => {
  const milestone = await milestoneService.deleteMilestone(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, milestone, 'Milestone deleted successfully'));
});

const bulkSaveMilestones = asyncWrapper(async (req, res) => {
  const milestones = await milestoneService.bulkSaveMilestones(req.params.quotationId, req.body.milestones);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, milestones, 'Milestones bulk saved successfully'));
});

module.exports = {
  createMilestone,
  getMilestonesByQuotation,
  updateMilestone,
  deleteMilestone,
  bulkSaveMilestones,
};
