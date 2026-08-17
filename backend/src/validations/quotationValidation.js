const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { VALID_STATUSES } = require('../constants/quotationStatus');

const createQuotationValidator = [
  body('client_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Client ID must be a positive integer'),
  body('companyId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Company ID must be a positive integer'),
  body('branchId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Branch ID must be a positive integer'),
  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('logo')
    .optional({ nullable: true })
    .trim(),
  body('billing_address')
    .optional({ nullable: true })
    .trim(),
  body('shipping_address')
    .optional({ nullable: true })
    .trim(),
  body('pincode')
    .optional({ nullable: true })
    .trim(),
  body('wizard_step')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 8 }),
  body('opportunity_name')
    .optional({ nullable: true })
    .trim(),
  body('proposal_date')
    .optional({ nullable: true }),
  body('valid_till')
    .optional({ nullable: true }),
  body('revision_version')
    .optional({ nullable: true })
    .trim(),
  body('prepared_by_id')
    .optional({ nullable: true }),
  body('prepared_by_designation')
    .optional({ nullable: true })
    .trim(),
  body('prepared_by_department')
    .optional({ nullable: true })
    .trim(),
  body('project_summary')
    .optional({ nullable: true })
    .trim(),
  body('engagement_type')
    .optional({ nullable: true })
    .trim(),
  body('pricing_currency')
    .optional({ nullable: true })
    .trim(),
  body('exchange_rate')
    .optional({ nullable: true })
    .isNumeric(),
  validate,
];

const updateQuotationValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Quotation ID is required'),
  body('client_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Client ID must be a positive integer'),
  body('companyId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Company ID must be a positive integer'),
  body('branchId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Branch ID must be a positive integer'),
  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('logo')
    .optional({ nullable: true })
    .trim(),
  body('billing_address')
    .optional({ nullable: true })
    .trim(),
  body('shipping_address')
    .optional({ nullable: true })
    .trim(),
  body('pincode')
    .optional({ nullable: true })
    .trim(),
  body('wizard_step')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 8 }),
  body('opportunity_name')
    .optional({ nullable: true })
    .trim(),
  body('proposal_date')
    .optional({ nullable: true }),
  body('valid_till')
    .optional({ nullable: true }),
  body('revision_version')
    .optional({ nullable: true })
    .trim(),
  body('prepared_by_id')
    .optional({ nullable: true }),
  body('prepared_by_designation')
    .optional({ nullable: true })
    .trim(),
  body('prepared_by_department')
    .optional({ nullable: true })
    .trim(),
  body('project_summary')
    .optional({ nullable: true })
    .trim(),
  body('engagement_type')
    .optional({ nullable: true })
    .trim(),
  body('pricing_currency')
    .optional({ nullable: true })
    .trim(),
  body('exchange_rate')
    .optional({ nullable: true }),
  body('total_effort_hours')
    .optional({ nullable: true }),
  body('productivity_basis')
    .optional({ nullable: true }),
  body('average_productivity')
    .optional({ nullable: true }),
  body('estimation_effort_cost')
    .optional({ nullable: true }),
  body('estimation_contingency_percentage')
    .optional({ nullable: true }),
  body('estimation_contingency_amount')
    .optional({ nullable: true }),
  body('estimation_subtotal')
    .optional({ nullable: true }),
  body('estimation_profit_margin_percentage')
    .optional({ nullable: true }),
  body('estimation_profit_margin_amount')
    .optional({ nullable: true }),
  body('estimated_project_cost')
    .optional({ nullable: true }),
  body('estimation_notes')
    .optional({ nullable: true }),
  body('total_labor_cost')
    .optional({ nullable: true }),
  body('travel_expenses')
    .optional({ nullable: true }),
  body('third_party_tools_cost')
    .optional({ nullable: true }),
  body('infrastructure_hosting_cost')
    .optional({ nullable: true }),
  body('team_subtotal')
    .optional({ nullable: true }),
  body('team_contingency_percentage')
    .optional({ nullable: true }),
  body('team_contingency_amount')
    .optional({ nullable: true }),
  body('team_subtotal_after_contingency')
    .optional({ nullable: true }),
  body('team_profit_margin_percentage')
    .optional({ nullable: true }),
  body('team_profit_margin_amount')
    .optional({ nullable: true }),
  body('team_total_project_cost')
    .optional({ nullable: true }),
  body('working_days_per_month')
    .optional({ nullable: true }),
  body('working_hours_per_day')
    .optional({ nullable: true }),
  body('total_working_hours_per_month')
    .optional({ nullable: true }),
  body('total_outstanding_pricing_excl_gst')
    .optional({ nullable: true }),
  body('gst_percentage')
    .optional({ nullable: true }),
  body('gst_amount')
    .optional({ nullable: true }),
  body('discount_type')
    .optional({ nullable: true }),
  body('discount_value')
    .optional({ nullable: true }),
  body('discount_amount')
    .optional({ nullable: true }),
  body('final_outstanding_amount')
    .optional({ nullable: true }),
  body('project_start_date')
    .optional({ nullable: true }),
  body('project_end_date')
    .optional({ nullable: true }),
  body('working_days')
    .optional({ nullable: true }),
  body('important_notes')
    .optional({ nullable: true }),
  validate,
];

const idParamValidator = [
  param('id')
    .isInt({ min: 0 })
    .withMessage('Valid Quotation ID (0 for all) is required'),
  validate,
];

module.exports = {
  createQuotationValidator,
  updateQuotationValidator,
  idParamValidator,
};

