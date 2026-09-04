const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 }),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('role_id')
    .notEmpty()
    .withMessage('Role ID is required')
    .isInt()
    .withMessage('Role ID must be an integer'),
  body('reporting_manager_id')
    .optional({ nullable: true })
    .isInt(),
  validate,
];

const updateUserValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid User ID is required'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('phone')
    .optional({ nullable: true })
    .trim(),
  body('role_id')
    .optional()
    .isInt(),
  body('reporting_manager_id')
    .optional({ nullable: true })
    .isInt(),
  body('is_active')
    .optional()
    .isBoolean(),
  validate,
];

module.exports = {
  createUserValidator,
  updateUserValidator,
};
