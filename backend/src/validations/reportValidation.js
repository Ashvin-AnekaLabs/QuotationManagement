const { query } = require('express-validator');
const validate = require('../middlewares/validate');
const { VALID_STATUSES } = require('../constants/quotationStatus');

const dashboardReportValidator = [
  query('fromDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('fromDate must be a valid date format (YYYY-MM-DD)'),
  query('toDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('toDate must be a valid date format (YYYY-MM-DD)'),
  query('startDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('startDate must be a valid date format (YYYY-MM-DD)'),
  query('start_date')
    .optional({ nullable: true })
    .isDate()
    .withMessage('start_date must be a valid date format (YYYY-MM-DD)'),
  query('endDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('endDate must be a valid date format (YYYY-MM-DD)'),
  query('end_date')
    .optional({ nullable: true })
    .isDate()
    .withMessage('end_date must be a valid date format (YYYY-MM-DD)'),
  query('clientId')
    .optional({ nullable: true })
    .isInt({ min: 0 }),
  query('client_id')
    .optional({ nullable: true })
    .isInt({ min: 0 }),
  query('employeeId')
    .optional({ nullable: true })
    .isInt({ min: 0 }),
  query('employee_id')
    .optional({ nullable: true })
    .isInt({ min: 0 }),
  query('status')
    .optional({ nullable: true })
    .isIn(VALID_STATUSES)
    .withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
  validate,
];

const exportReportValidator = [
  query('format')
    .notEmpty()
    .withMessage('format parameter (pdf or excel) is required')
    .toLowerCase()
    .isIn(['pdf', 'excel', 'xlsx'])
    .withMessage('format must be either "pdf" or "excel"'),
  query('fromDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('fromDate must be a valid date format (YYYY-MM-DD)'),
  query('toDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('toDate must be a valid date format (YYYY-MM-DD)'),
  query('startDate')
    .optional({ nullable: true })
    .isDate(),
  query('endDate')
    .optional({ nullable: true })
    .isDate(),
  validate,
];

module.exports = {
  dashboardReportValidator,
  exportReportValidator,
};
