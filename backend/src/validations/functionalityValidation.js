const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createFunctionalityValidator = [
  param('scopeId')
    .isInt({ min: 1 })
    .withMessage('Valid Scope ID is required in URL parameter'),
  body('module')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('functionality')
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

const updateFunctionalityValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Functionality ID is required'),
  body('module')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('functionality')
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

const scopeIdParamValidator = [
  param('scopeId')
    .isInt({ min: 1 })
    .withMessage('Valid Scope ID is required'),
  validate,
];

const idParamValidator = [
  param('id')
    .isInt({ min: 0 })
    .withMessage('Valid Functionality ID (0 for all) is required'),
  validate,
];

module.exports = {
  createFunctionalityValidator,
  updateFunctionalityValidator,
  scopeIdParamValidator,
  idParamValidator,
};
