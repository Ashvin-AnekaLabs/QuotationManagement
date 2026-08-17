const branchMasterService = require('../services/branchMaster.service');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createBranch = asyncWrapper(async (req, res) => {
  const result = await branchMasterService.createBranch(req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, 'Branch created successfully'));
});

const getBranches = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  // If specific ID is provided, fetch that branch
  if (id) {
    const result = await branchMasterService.getBranchById(id);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, result, 'Branch details fetched successfully'));
  }
});

const getBranchesByCompany = asyncWrapper(async (req, res) => {
  const { companyId } = req.params;
  const result = await branchMasterService.getBranchesByCompanyId(companyId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Company branches fetched successfully'));
});

const updateBranch = asyncWrapper(async (req, res) => {
  const result = await branchMasterService.updateBranch(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Branch updated successfully'));
});

const deleteBranch = asyncWrapper(async (req, res) => {
  await branchMasterService.deleteBranch(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Branch deleted successfully'));
});

module.exports = {
  createBranch,
  getBranches,
  getBranchesByCompany,
  updateBranch,
  deleteBranch,
};
