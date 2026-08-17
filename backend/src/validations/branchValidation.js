const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createBranchValidator = [
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isInt({ min: 1 })
    .withMessage('Valid Company ID is required'),
  body('branchName')
    .trim()
    .notEmpty()
    .withMessage('Branch name is required')
    .isLength({ max: 255 })
    .withMessage('Branch name must not exceed 255 characters'),
  body('addressLine1')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }),
  body('addressLine2')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }),
  body('city')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body('state')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body('country')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body('pincode')
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
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate,
];

const updateBranchValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Branch ID is required'),
  body('companyId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid Company ID is required'),
  body('branchName')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Branch name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Branch name must not exceed 255 characters'),
  body('addressLine1')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }),
  body('addressLine2')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }),
  body('city')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body('state')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body('country')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
  body('pincode')
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
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate,
];

const idParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Branch ID is required'),
  validate,
];

const companyIdParamValidator = [
  param('companyId')
    .isInt({ min: 1 })
    .withMessage('Valid Company ID is required'),
  validate,
];

module.exports = {
  createBranchValidator,
  updateBranchValidator,
  idParamValidator,
  companyIdParamValidator,
};
