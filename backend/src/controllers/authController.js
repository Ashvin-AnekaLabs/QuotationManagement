const authService = require('../services/authService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const login = asyncWrapper(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Login successful'));
});

const refreshToken = asyncWrapper(async (req, res) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Token refreshed successfully'));
});

const logout = asyncWrapper(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Logged out successfully'));
});

const forgotPassword = asyncWrapper(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, result.message));
});

const resetPassword = asyncWrapper(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Password reset successfully'));
});

const changePassword = asyncWrapper(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Password changed successfully'));
});

module.exports = {
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
