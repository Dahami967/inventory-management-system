/**
 * Format number as Sri Lankan Rupees
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with Rs. prefix
 */
export const formatLKR = (amount) => {
  return `Rs. ${Number(amount).toFixed(2)}`;
};

/**
 * Format large numbers with commas
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with commas
 */
export const formatNumber = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
