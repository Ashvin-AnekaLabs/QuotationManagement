const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createClientValidator = [
  body('contact_person')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('name')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Phone number must not exceed 50 characters'),
  body('company_name')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('address')
    .optional({ nullable: true })
    .trim(),
  body('pan_number')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('gst_number')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('website')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('currency')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('country')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }),
  body('state')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }),
  body('city')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }),
  body('status')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  validate,
];

const updateClientValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Client ID is required'),
  body('contact_person')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('name')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('company_name')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('address')
    .optional({ nullable: true })
    .trim(),
  body('pan_number')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('gst_number')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('website')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('currency')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  body('country')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }),
  body('state')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }),
  body('city')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }),
  body('status')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }),
  validate,
];

const idParamValidator = [
  param('id')
    .isInt({ min: 0 })
    .withMessage('Valid Client ID (0 for all) is required'),
  validate,
];

module.exports = {
  createClientValidator,
  updateClientValidator,
  idParamValidator,
};

