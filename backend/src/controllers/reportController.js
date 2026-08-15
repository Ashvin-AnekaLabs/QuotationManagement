const reportService = require('../services/reportService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const getDashboardReport = asyncWrapper(async (req, res) => {
  const report = await reportService.getDashboardReport(req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, report, 'Dashboard report data fetched successfully'));
});

const exportReport = asyncWrapper(async (req, res) => {
  await reportService.exportReport(req.query, res);
});

module.exports = {
  getDashboardReport,
  exportReport,
};
