const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const assignTeamMemberValidator = [
  param('quotationId')
    .isInt({ min: 1 })
    .withMessage('Valid Quotation ID is required in URL parameter'),
  body('employee_id')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer'),
  body('role_designation')
    .optional({ nullable: true })
    .trim(),
  body('technology_skill')
    .optional({ nullable: true })
    .trim(),
  body('hours')
    .optional({ nullable: true }),
  body('days')
    .optional({ nullable: true }),
  body('hours_per_day')
    .optional({ nullable: true }),
  body('working_days')
    .optional({ nullable: true }),
  body('hourly_rate')
    .optional({ nullable: true }),
  validate,
];

const updateTeamMemberValidator = [
  param('quotationId')
    .isInt({ min: 1 })
    .withMessage('Valid Quotation ID is required'),
  param('teamId')
    .isInt({ min: 1 })
    .withMessage('Valid Team Member ID is required'),
  body('hours_per_day')
    .optional()
    .isFloat({ min: 0.1, max: 24 })
    .withMessage('Hours per day must be between 0.1 and 24'),
  body('working_days')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Working days must be at least 0 days'),
  body('hourly_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a non-negative number'),
  validate,
];

const teamIdParamValidator = [
  param('quotationId')
    .isInt({ min: 1 })
    .withMessage('Valid Quotation ID is required'),
  param('teamId')
    .isInt({ min: 0 })
    .withMessage('Valid Team Member ID (0 for all) is required'),
  validate,
];

const quotationIdParamValidator = [
  param('quotationId')
    .isInt({ min: 1 })
    .withMessage('Valid Quotation ID is required'),
  validate,
];

module.exports = {
  assignTeamMemberValidator,
  updateTeamMemberValidator,
  teamIdParamValidator,
  quotationIdParamValidator,
};
