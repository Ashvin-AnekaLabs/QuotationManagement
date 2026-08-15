const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const createTaxValidator = [
  body('taxName')
    .notEmpty()
    .withMessage('Tax name is required')
    .isString()
    .withMessage('Tax name must be a string')
    .trim(),
  body('taxType')
    .notEmpty()
    .withMessage('Tax type is required')
    .isString()
    .withMessage('Tax type must be a string'),
  body('taxRate')
    .notEmpty()
    .withMessage('Tax rate is required')
    .isFloat({ min: 0.00, max: 100.00 })
    .withMessage('Tax rate must be a valid percentage between 0 and 100'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value'),
  validate,
];

const updateTaxValidator = [
  body('taxName')
    .optional()
    .isString()
    .withMessage('Tax name must be a string')
    .trim(),
  body('taxType')
    .optional()
    .isString()
    .withMessage('Tax type must be a string'),
  body('taxRate')
    .optional()
    .isFloat({ min: 0.00, max: 100.00 })
    .withMessage('Tax rate must be a valid percentage between 0 and 100'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value'),
  validate,
];

module.exports = {
  createTaxValidator,
  updateTaxValidator,
};
