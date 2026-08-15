const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

const createDropdownValidator = [
  body('dropdownName')
    .notEmpty()
    .withMessage('Dropdown name is required')
    .isString()
    .withMessage('Dropdown name must be a string')
    .trim(),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean'),
  body('options')
    .isArray({ min: 1 })
    .withMessage('At least one option is required when creating a dropdown')
    .custom((options) => {
      const labels = new Set();
      const values = new Set();
      for (const opt of options) {
        if (!opt.optionLabel || typeof opt.optionLabel !== 'string' || !opt.optionLabel.trim()) {
          throw new Error('All options must have a valid optionLabel');
        }
        if (!opt.optionValue || typeof opt.optionValue !== 'string' || !opt.optionValue.trim()) {
          throw new Error('All options must have a valid optionValue');
        }
        const cleanLabel = opt.optionLabel.trim().toLowerCase();
        const cleanValue = opt.optionValue.trim().toLowerCase();

        if (labels.has(cleanLabel)) {
          throw new Error(`Duplicate option label found: "${opt.optionLabel}"`);
        }
        if (values.has(cleanValue)) {
          throw new Error(`Duplicate option value found: "${opt.optionValue}"`);
        }
        labels.add(cleanLabel);
        values.add(cleanValue);

        if (opt.displayOrder !== undefined && (!Number.isInteger(opt.displayOrder) || opt.displayOrder < 0)) {
          throw new Error('displayOrder must be a non-negative integer');
        }
      }
      return true;
    }),
  validate,
];

const updateDropdownValidator = [
  body('dropdownName')
    .optional()
    .isString()
    .withMessage('Dropdown name must be a string')
    .trim(),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean'),
  body('options')
    .optional()
    .isArray()
    .withMessage('options must be an array')
    .custom((options) => {
      const labels = new Set();
      const values = new Set();
      for (const opt of options) {
        if (!opt.optionLabel || typeof opt.optionLabel !== 'string' || !opt.optionLabel.trim()) {
          throw new Error('All options must have a valid optionLabel');
        }
        if (!opt.optionValue || typeof opt.optionValue !== 'string' || !opt.optionValue.trim()) {
          throw new Error('All options must have a valid optionValue');
        }
        const cleanLabel = opt.optionLabel.trim().toLowerCase();
        const cleanValue = opt.optionValue.trim().toLowerCase();

        if (labels.has(cleanLabel)) {
          throw new Error(`Duplicate option label found: "${opt.optionLabel}"`);
        }
        if (values.has(cleanValue)) {
          throw new Error(`Duplicate option value found: "${opt.optionValue}"`);
        }
        labels.add(cleanLabel);
        values.add(cleanValue);

        if (opt.displayOrder !== undefined && (!Number.isInteger(opt.displayOrder) || opt.displayOrder < 0)) {
          throw new Error('displayOrder must be a non-negative integer');
        }
      }
      return true;
    }),
  validate,
];

const createOptionValidator = [
  body('optionLabel')
    .notEmpty()
    .withMessage('Option label is required')
    .isString()
    .withMessage('Option label must be a string')
    .trim(),
  body('optionValue')
    .notEmpty()
    .withMessage('Option value is required')
    .isString()
    .withMessage('Option value must be a string')
    .trim(),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean'),
  validate,
];

const updateOptionValidator = [
  body('optionLabel')
    .optional()
    .isString()
    .withMessage('Option label must be a string')
    .trim(),
  body('optionValue')
    .optional()
    .isString()
    .withMessage('Option value must be a string')
    .trim(),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean'),
  validate,
];

module.exports = {
  createDropdownValidator,
  updateDropdownValidator,
  createOptionValidator,
  updateOptionValidator,
};
