import validator from 'validator';

/**
 * Validate email format
 */
export function validateEmail(email) {
  return validator.isEmail(email);
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone) {
  // Accept various phone formats
  const phoneRegex = /^[\d\s\-\+\(\)\.]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate date format
 */
export function validateDate(date) {
  return validator.isISO8601(date);
}

/**
 * Validate currency amount
 */
export function validateAmount(amount) {
  const parsed = parseFloat(amount);
  return !isNaN(parsed) && parsed > 0;
}

/**
 * Validate URL format
 */
export function validateUrl(url) {
  return validator.isURL(url);
}

/**
 * Validate member ID format
 */
export function validateMemberId(id) {
  return /^mem-[\w]{8,}$/.test(id);
}

/**
 * Validate service ID format
 */
export function validateServiceId(id) {
  return /^srv-[\w]{8,}$/.test(id);
}

export default {
  validateEmail,
  validatePhoneNumber,
  validateDate,
  validateAmount,
  validateUrl,
  validateMemberId,
  validateServiceId
};

