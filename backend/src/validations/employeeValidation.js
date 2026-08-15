const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createEmployeeValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Employee name is required')
    .isLength({ min: 2, max: 255 }),
  body('employee_code')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('role')
    .optional({ nullable: true })
    .trim(),
  body('designation')
    .optional({ nullable: true })
    .trim(),
  body('department')
    .optional({ nullable: true })
    .trim(),
  body('hourly_rate')
    .notEmpty()
    .withMessage('Hourly rate is required')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a non-negative number'),
  body('assigned_project')
    .optional({ nullable: true })
    .trim(),
  validate,
];

const updateEmployeeValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Employee ID is required'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('employee_code')
    .optional({ nullable: true })
    .trim(),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .optional({ nullable: true })
    .trim(),
  body('role')
    .optional({ nullable: true })
    .trim(),
  body('designation')
    .optional({ nullable: true })
    .trim(),
  body('department')
    .optional({ nullable: true })
    .trim(),
  body('hourly_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a non-negative number'),
  body('assigned_project')
    .optional({ nullable: true })
    .trim(),
  validate,
];

const idParamValidator = [
  param('id')
    .isInt({ min: 0 })
    .withMessage('Valid Employee ID (0 for all) is required'),
  validate,
];

module.exports = {
  createEmployeeValidator,
  updateEmployeeValidator,
  idParamValidator,
};
