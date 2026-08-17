const companyMasterService = require('../services/companyMaster.service');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createCompany = asyncWrapper(async (req, res) => {
  const result = await companyMasterService.createCompany(req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, 'Company created successfully'));
});

const getCompanies = asyncWrapper(async (req, res) => {
  const id = parseInt(req.params.id, 10);

  // id=0 means fetch all companies
  if (id === 0) {
    const result = await companyMasterService.getCompanies({ fetchAll: true });
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, { companies: result }, 'Companies fetched successfully'));
  }

  // Otherwise fetch specific company by ID
  const result = await companyMasterService.getCompanyById(id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Company details fetched successfully'));
});

const updateCompany = asyncWrapper(async (req, res) => {
  const result = await companyMasterService.updateCompany(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Company updated successfully'));
});

const deleteCompany = asyncWrapper(async (req, res) => {
  await companyMasterService.deleteCompany(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Company deleted successfully'));
});

module.exports = {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
};
