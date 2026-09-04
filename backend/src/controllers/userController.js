const userService = require('../services/userService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createUser = asyncWrapper(async (req, res) => {
  const user = await userService.createUser(req.user, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, user, 'User created successfully and credentials sent via email'));
});

const getUsers = asyncWrapper(async (req, res) => {
  const result = await userService.getAllUsers(req.user, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Users fetched successfully'));
});

const getManagersDropdown = asyncWrapper(async (req, res) => {
  const managers = await userService.getManagers();
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, managers, 'Managers list fetched successfully'));
});

const updateUser = asyncWrapper(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.user, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, user, 'User updated successfully'));
});

const deleteUser = asyncWrapper(async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, result.message));
});

module.exports = {
  createUser,
  getUsers,
  getManagersDropdown,
  updateUser,
  deleteUser,
};
