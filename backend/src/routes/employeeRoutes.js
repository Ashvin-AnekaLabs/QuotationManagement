const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const {
  createEmployeeValidator,
  updateEmployeeValidator,
  idParamValidator,
} = require('../validations/employeeValidation');

const authMiddleware = require('../middlewares/authMiddleware');
const authorizePermission = require('../middlewares/permissionMiddleware');

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

router.post('/', createEmployeeValidator, authorizePermission('EMPLOYEES', 'can_add'), employeeController.createEmployee);

// Get all unique roles
router.get('/roles', authorizePermission('EMPLOYEES', 'can_view'), employeeController.getRoles);

// Single GET /employees/:id (0 = get all, >0 = get by ID)
router
  .route('/:id')
  .get(idParamValidator, authorizePermission('EMPLOYEES', 'can_view'), employeeController.getEmployee)
  .put(updateEmployeeValidator, authorizePermission('EMPLOYEES', 'can_edit'), employeeController.updateEmployee)
  .delete(idParamValidator, authorizePermission('EMPLOYEES', 'can_delete'), employeeController.deleteEmployee);

module.exports = router;
