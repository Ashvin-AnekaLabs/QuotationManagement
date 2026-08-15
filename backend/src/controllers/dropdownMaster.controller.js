const dropdownMasterService = require('../services/dropdownMaster.service');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createDropdown = asyncWrapper(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const result = await dropdownMasterService.createDropdown(req.body, userId);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, 'Dropdown master created successfully'));
});

const getDropdowns = asyncWrapper(async (req, res) => {
  const result = await dropdownMasterService.getDropdowns(req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Dropdown masters fetched successfully'));
});

const getDropdownById = asyncWrapper(async (req, res) => {
  const result = await dropdownMasterService.getDropdownById(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Dropdown master details fetched successfully'));
});

const updateDropdown = asyncWrapper(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const result = await dropdownMasterService.updateDropdown(req.params.id, req.body, userId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Dropdown master updated successfully'));
});

const deleteDropdown = asyncWrapper(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  await dropdownMasterService.deleteDropdown(req.params.id, userId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Dropdown master deleted/deactivated successfully'));
});

// Options specific controllers
const getOptionsByDropdownId = asyncWrapper(async (req, res) => {
  const result = await dropdownMasterService.getOptionsByDropdownId(req.params.dropdownMasterId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Dropdown options fetched successfully'));
});

const addOption = asyncWrapper(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const result = await dropdownMasterService.addOption(req.params.dropdownMasterId, req.body, userId);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, 'Dropdown option added successfully'));
});

const updateOption = asyncWrapper(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const result = await dropdownMasterService.updateOption(req.params.optionId, req.body, userId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Dropdown option updated successfully'));
});

const deleteOption = asyncWrapper(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  await dropdownMasterService.deleteOption(req.params.optionId, userId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Dropdown option deleted/deactivated successfully'));
});

module.exports = {
  createDropdown,
  getDropdowns,
  getDropdownById,
  updateDropdown,
  deleteDropdown,
  getOptionsByDropdownId,
  addOption,
  updateOption,
  deleteOption,
};
