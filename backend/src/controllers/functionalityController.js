const functionalityService = require('../services/functionalityService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createFunctionality = asyncWrapper(async (req, res) => {
  const functionality = await functionalityService.createFunctionality(
    req.params.scopeId,
    req.body
  );
  res
    .status(HTTP_STATUS.CREATED)
    .json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        functionality,
        'Functionality created successfully'
      )
    );
});

/**
 * Single GET endpoint for Functionalities
 * If id == 0: returns all functionalities (for specified scopeId or system-wide)
 * If id > 0: returns functionality by specific ID
 */
const getFunctionality = asyncWrapper(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const scopeId = req.params.scopeId ? parseInt(req.params.scopeId, 10) : null;

  if (id === 0) {
    const list = scopeId
      ? await functionalityService.getFunctionalitiesByScopeId(scopeId)
      : await functionalityService.getAllFunctionalities(req.query);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, list, 'Functionalities fetched successfully'));
  }

  const func = await functionalityService.getFunctionalityById(id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, func, 'Functionality details fetched successfully'));
});

const updateFunctionality = asyncWrapper(async (req, res) => {
  const func = await functionalityService.updateFunctionality(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, func, 'Functionality updated successfully'));
});

const deleteFunctionality = asyncWrapper(async (req, res) => {
  const func = await functionalityService.deleteFunctionality(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, func, 'Functionality deleted successfully'));
});

module.exports = {
  createFunctionality,
  getFunctionality,
  updateFunctionality,
  deleteFunctionality,
};
