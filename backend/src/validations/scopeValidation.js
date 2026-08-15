const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createScopeValidator = [
  param('quotationId')
    .isInt({ min: 1 })
    .withMessage('Valid Quotation ID is required in URL parameter'),
  body('module')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('subtext')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('module_subtext')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('category')
    .optional({ nullable: true })
    .trim(),
  body('priority')
    .optional({ nullable: true })
    .trim(),
  body('est_hours')
    .optional({ nullable: true }),
  body('est_days')
    .optional({ nullable: true }),
  body('timeline_days')
    .optional({ nullable: true }),
  body('rate_per_hour')
    .optional({ nullable: true }),
  body('effort_cost')
    .optional({ nullable: true }),
  body('complexity')
    .optional({ nullable: true })
    .trim(),
  body('sort_order')
    .optional({ nullable: true }),
  validate,
];

const updateScopeValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Scope ID is required'),
  body('module')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('subtext')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('module_subtext')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('category')
    .optional({ nullable: true })
    .trim(),
  body('priority')
    .optional({ nullable: true })
    .trim(),
  body('est_hours')
    .optional({ nullable: true }),
  body('est_days')
    .optional({ nullable: true }),
  body('timeline_days')
    .optional({ nullable: true }),
  body('rate_per_hour')
    .optional({ nullable: true }),
  body('effort_cost')
    .optional({ nullable: true }),
  body('complexity')
    .optional({ nullable: true })
    .trim(),
  body('sort_order')
    .optional({ nullable: true }),
  validate,
];

const quotationIdParamValidator = [
  param('quotationId')
    .isInt({ min: 1 })
    .withMessage('Valid Quotation ID is required'),
  validate,
];

const idParamValidator = [
  param('id')
    .isInt({ min: 0 })
    .withMessage('Valid Scope ID (0 for all) is required'),
  validate,
];

module.exports = {
  createScopeValidator,
  updateScopeValidator,
  quotationIdParamValidator,
  idParamValidator,
};
