const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createMilestoneValidator = [
  body('quotation_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Quotation ID must be a positive integer'),
  body('milestone_name')
    .trim()
    .notEmpty()
    .withMessage('Milestone name is required')
    .isLength({ max: 255 }),
  body('milestone_subtext')
    .optional({ nullable: true })
    .trim(),
  body('start_date')
    .optional({ nullable: true }),
  body('end_date')
    .optional({ nullable: true }),
  body('duration_days')
    .optional()
    .isInt({ min: 0 }),
  body('sort_order')
    .optional()
    .isInt({ min: 0 }),
  validate,
];


const updateMilestoneValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Milestone ID is required'),
  body('milestone_name')
    .optional()
    .trim()
    .isLength({ max: 255 }),
  body('milestone_subtext')
    .optional({ nullable: true })
    .trim(),
  body('start_date')
    .optional({ nullable: true }),
  body('end_date')
    .optional({ nullable: true }),
  body('duration_days')
    .optional()
    .isInt({ min: 0 }),
  body('sort_order')
    .optional()
    .isInt({ min: 0 }),
  validate,
];

const bulkMilestoneValidator = [
  param('quotationId')
    .isInt({ min: 1 })
    .withMessage('Valid Quotation ID is required'),
  body('milestones')
    .isArray()
    .withMessage('Milestones must be an array'),
  validate,
];

const idParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Milestone ID is required'),
  validate,
];

module.exports = {
  createMilestoneValidator,
  updateMilestoneValidator,
  bulkMilestoneValidator,
  idParamValidator,
};
