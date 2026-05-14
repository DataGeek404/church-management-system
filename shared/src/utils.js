import crypto from 'crypto';

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500); // Limit length
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(ipAddress, limit = 100, windowMs = 60000) {
  // This would connect to a real rate limiter in production
  return true;
}

/**
 * Retry async function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}

/**
 * Paginate array
 */
export function paginate(array, page = 1, limit = 50) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    data: array.slice(startIndex, endIndex),
    total: array.length,
    page,
    limit,
    totalPages: Math.ceil(array.length / limit)
  };
}

export default {
  generateId,
  getCurrentTimestamp,
  sanitizeInput,
  formatDate,
  calculateAge,
  formatCurrency,
  checkRateLimit,
  retryWithBackoff,
  paginate
};

