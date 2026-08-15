/**
 * Quotation Lifecycle Statuses
 */
const QUOTATION_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const VALID_STATUSES = Object.values(QUOTATION_STATUS);

module.exports = {
  QUOTATION_STATUS,
  VALID_STATUSES,
};
