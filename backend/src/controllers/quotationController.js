const quotationService = require('../services/quotationService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createQuotation = asyncWrapper(async (req, res) => {
  const quotation = await quotationService.createQuotation(req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, quotation, 'Quotation created successfully'));
});

/**
 * Single GET endpoint for Quotations
 * If id == 0: returns all quotations
 * If id > 0: returns quotation by specific ID
 */
const getQuotation = asyncWrapper(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === 0) {
    const result = await quotationService.getAllQuotations(req.query);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, result, 'Quotations fetched successfully'));
  }
  const quotation = await quotationService.getQuotationById(id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, quotation, 'Quotation details fetched successfully'));
});

const updateQuotation = asyncWrapper(async (req, res) => {
  const quotation = await quotationService.updateQuotation(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, quotation, 'Quotation updated successfully'));
});

const deleteQuotation = asyncWrapper(async (req, res) => {
  const quotation = await quotationService.deleteQuotation(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, quotation, 'Quotation deleted successfully'));
});

const getQuotationSummary = asyncWrapper(async (req, res) => {
  const summary = await quotationService.getQuotationSummary(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, summary, 'Quotation summary fetched successfully'));
});

const exportQuotationPdf = asyncWrapper(async (req, res) => {
  await quotationService.exportQuotationPdf(req.params.id, res);
});

const exportTimelineExcel = asyncWrapper(async (req, res) => {
  const id = req.params.id || req.params.quotationId;
  await quotationService.exportTimelineExcel(id, res);
});



const getCommercial = asyncWrapper(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const commercial = await quotationService.getCommercial(id, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, commercial, id === 0 ? 'All quotation commercial summaries fetched successfully' : 'Commercial details fetched successfully'));
});

const updateCommercial = asyncWrapper(async (req, res) => {
  const commercial = await quotationService.updateCommercial(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, commercial, 'Commercial details updated successfully'));
});

module.exports = {
  createQuotation,
  getQuotation,
  updateQuotation,
  deleteQuotation,
  getQuotationSummary,
  exportQuotationPdf,
  exportTimelineExcel,
  getCommercial,
  updateCommercial,
};
