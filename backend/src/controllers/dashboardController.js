const dashboardService = require('../services/dashboardService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const getDashboard = asyncWrapper(async (req, res) => {
  const data = await dashboardService.getDashboardData();
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, data, 'Dashboard metrics fetched successfully'));
});

module.exports = {
  getDashboard,
};
