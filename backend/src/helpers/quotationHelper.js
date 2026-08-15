/**
 * Quotation Calculation & Number Formatting Helpers
 */

/**
 * Generate unique quotation number: QTN-YYYYMM-XXXX
 * @param {number} sequenceNumber 
 * @returns {string}
 */
const generateQuotationNumber = (sequenceNumber = 1) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const paddedSeq = String(sequenceNumber).padStart(4, '0');
  return `QTN-${year}${month}-${paddedSeq}`;
};

/**
 * Calculate employee assignment total cost
 * Formula: Hourly Rate * Hours/Day * Working Days
 * @param {number} hourlyRate 
 * @param {number} hoursPerDay 
 * @param {number} workingDays 
 * @returns {number}
 */
const calculateEmployeeCost = (hourlyRate, hoursPerDay, workingDays) => {
  const rate = parseFloat(hourlyRate) || 0;
  const hours = parseFloat(hoursPerDay) || 0;
  const days = parseInt(workingDays, 10) || 0;
  return parseFloat((rate * hours * days).toFixed(2));
};

/**
 * Format numeric amount into Dollar currency string e.g. $75.00
 * @param {number|string} amount 
 * @returns {string}
 */
const formatCurrency = (amount) => {
  const val = parseFloat(amount);
  if (isNaN(val)) return 'Rs. 0.00';
  return `Rs. ${val.toFixed(2)}`;
};

/**
 * Format a Date object, ISO string, or Timestamp into local YYYY-MM-DD format
 * Prevents UTC off-by-one day issue on positive timezones (e.g. IST +5:30)
 * @param {Date|string} dateVal 
 * @returns {string}
 */
const formatDate = (dateVal) => {
  if (!dateVal) return '-';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return dateVal;
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

module.exports = {
  generateQuotationNumber,
  calculateEmployeeCost,
  formatCurrency,
  formatDate,
};

