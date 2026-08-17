const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createCompanyValidator = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 255 })
    .withMessage('Company name must not exceed 255 characters'),
  body('pan')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }),
  body('gstin')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 255 }),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Phone number must not exceed 50 characters'),
  body('website')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate,
];

const updateCompanyValidator = [
  param('id')
    .isInt({ min: 0 })
    .withMessage('Valid Company ID (0 for all) is required'),
  body('companyName')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Company name must not exceed 255 characters'),
  body('pan')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }),
  body('gstin')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 255 }),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Phone number must not exceed 50 characters'),
  body('website')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate,
];

const idParamValidator = [
  param('id')
    .isInt({ min: 0 })
    .withMessage('Valid Company ID (0 for all) is required'),
  validate,
];

module.exports = {
  createCompanyValidator,
  updateCompanyValidator,
  idParamValidator,
};
