const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const {
  createEmployeeValidator,
  updateEmployeeValidator,
  idParamValidator,
} = require('../validations/employeeValidation');

router.post('/', createEmployeeValidator, employeeController.createEmployee);

// Get all unique roles
router.get('/roles', employeeController.getRoles);

// Single GET /employees/:id (0 = get all, >0 = get by ID)
router
  .route('/:id')
  .get(idParamValidator, employeeController.getEmployee)
  .put(updateEmployeeValidator, employeeController.updateEmployee)
  .delete(idParamValidator, employeeController.deleteEmployee);

module.exports = router;
