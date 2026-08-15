const taxMasterService = require('../services/taxMaster.service');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createTax = asyncWrapper(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const result = await taxMasterService.createTax(req.body, userId);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, 'Tax master record created successfully'));
});

const getTaxes = asyncWrapper(async (req, res) => {
  const result = await taxMasterService.getTaxes(req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Tax master records fetched successfully'));
});

const getTaxById = asyncWrapper(async (req, res) => {
  const result = await taxMasterService.getTaxById(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Tax master record details fetched successfully'));
});

const updateTax = asyncWrapper(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const result = await taxMasterService.updateTax(req.params.id, req.body, userId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Tax master record updated successfully'));
});

const deleteTax = asyncWrapper(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  await taxMasterService.deleteTax(req.params.id, userId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Tax master record deleted/deactivated successfully'));
});

module.exports = {
  createTax,
  getTaxes,
  getTaxById,
  updateTax,
  deleteTax,
};
