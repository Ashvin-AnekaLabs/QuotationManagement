const employeeService = require('../services/employeeService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createEmployee = asyncWrapper(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, employee, 'Employee created successfully'));
});

/**
 * Single GET endpoint for Employees
 * If id == 0: returns all employees
 * If id > 0: returns employee by specific ID
 */
const getEmployee = asyncWrapper(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === 0) {
    const result = await employeeService.getAllEmployees(req.query);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, result, 'Employees fetched successfully'));
  }
  const employee = await employeeService.getEmployeeById(id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, employee, 'Employee details fetched successfully'));
});

const updateEmployee = asyncWrapper(async (req, res) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, employee, 'Employee updated successfully'));
});

const deleteEmployee = asyncWrapper(async (req, res) => {
  const employee = await employeeService.deleteEmployee(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, employee, 'Employee deleted successfully'));
});

const getRoles = asyncWrapper(async (req, res) => {
  const roles = await employeeService.getDistinctRoles();
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, roles, 'Employee roles fetched successfully'));
});

module.exports = {
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getRoles,
};
