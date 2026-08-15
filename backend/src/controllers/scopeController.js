const scopeService = require('../services/scopeService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createScope = asyncWrapper(async (req, res) => {
  const scope = await scopeService.createScope(req.params.quotationId, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, scope, 'Quotation scope added successfully'));
});

/**
 * Single GET endpoint for Scopes
 * If id == 0: returns all scopes (for specified quotationId or system-wide)
 * If id > 0: returns scope by specific ID
 */
const getScope = asyncWrapper(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const quotationId = req.params.quotationId ? parseInt(req.params.quotationId, 10) : null;

  if (id === 0) {
    const scopes = quotationId
      ? await scopeService.getScopesByQuotationId(quotationId)
      : await scopeService.getAllScopes(req.query);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, scopes, 'Quotation scopes fetched successfully'));
  }

  const scope = await scopeService.getScopeById(id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, scope, 'Scope details fetched successfully'));
});

const updateScope = asyncWrapper(async (req, res) => {
  const scope = await scopeService.updateScope(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, scope, 'Scope updated successfully'));
});

const deleteScope = asyncWrapper(async (req, res) => {
  const scope = await scopeService.deleteScope(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, scope, 'Scope deleted successfully'));
});

const syncModules = asyncWrapper(async (req, res) => {
  const quotationId = parseInt(req.params.quotationId, 10);
  const result = await scopeService.syncModules(quotationId, req.body.modules);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Modules synced successfully'));
});

const getModulesTree = asyncWrapper(async (req, res) => {
  const quotationId = parseInt(req.params.quotationId, 10);
  const scopes = await scopeService.getScopesByQuotationId(quotationId);
  // We need functionalities and team for each scope. 
  // Let's implement it inside scopeService.getModulesTree
  const tree = await scopeService.getModulesTree(quotationId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, tree, 'Modules tree fetched successfully'));
});

module.exports = {
  createScope,
  getScope,
  updateScope,
  deleteScope,
  syncModules,
  getModulesTree,
};
