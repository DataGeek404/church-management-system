/**
 * Type definitions for Church Management System
 * This is a reference for the shape of data across services
 */

/**
 * @typedef {Object} Member
 * @property {string} id - Unique member identifier
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} email - Email address
 * @property {string} [phoneNumber] - Phone number
 * @property {string} [dateOfBirth] - Date of birth (ISO 8601)
 * @property {string} [address] - Physical address
 * @property {string} registrationDate - Registration date (ISO 8601)
 * @property {string} updatedDate - Last update date (ISO 8601)
 * @property {'active'|'inactive'|'suspended'} status - Member status
 */

/**
 * @typedef {Object} AttendanceRecord
 * @property {string} id - Unique record identifier
 * @property {string} serviceId - Service identifier
 * @property {string} memberId - Member identifier
 * @property {string} checkInTime - Check-in time (ISO 8601)
 * @property {string} [checkOutTime] - Check-out time (ISO 8601)
 * @property {string} [notes] - Additional notes
 * @property {'checked-in'|'completed'} status - Record status
 * @property {string} recordedDate - Recording date (ISO 8601)
 */

/**
 * @typedef {Object} FinancialTransaction
 * @property {string} id - Transaction identifier
 * @property {string} accountId - Account identifier
 * @property {'income'|'expense'} type - Transaction type
 * @property {string} amount - Amount (stored as string for precision)
 * @property {string} description - Transaction description
 * @property {string} [memberId] - Associated member (if applicable)
 * @property {string} category - Transaction category
 * @property {'completed'|'pending'|'failed'} status - Transaction status
 * @property {string} recordedDate - Recording date (ISO 8601)
 * @property {Object} auditTrail - Audit information
 */

/**
 * @typedef {Object} Event
 * @property {string} id - Event identifier
 * @property {string} title - Event title
 * @property {string} [description] - Event description
 * @property {string} startTime - Start time (ISO 8601)
 * @property {string} endTime - End time (ISO 8601)
 * @property {string} [location] - Event location
 * @property {number} [capacity] - Maximum capacity
 * @property {string} type - Event type (e.g., 'service', 'fellowship')
 * @property {string[]} attendees - List of attendee member IDs
 * @property {'scheduled'|'ongoing'|'completed'|'cancelled'} status - Event status
 * @property {string} createdDate - Creation date (ISO 8601)
 * @property {string} updatedDate - Last update date (ISO 8601)
 */

/**
 * @typedef {Object} Message
 * @property {string} id - Message identifier
 * @property {string} messageId - Batch message identifier
 * @property {string} recipientId - Recipient member ID
 * @property {string} subject - Message subject
 * @property {string} body - Message body
 * @property {string} type - Message type (e.g., 'notification', 'announcement')
 * @property {'delivered'|'failed'|'read'} status - Message status
 * @property {string} sentTime - Sent time (ISO 8601)
 * @property {string} [readTime] - Read time (ISO 8601)
 */

/**
 * @typedef {Object} Report
 * @property {string} id - Report identifier
 * @property {string} type - Report type (e.g., 'membership', 'financial')
 * @property {string} [startDate] - Start date for the report period
 * @property {string} [endDate] - End date for the report period
 * @property {Object} filters - Additional filters applied
 * @property {Object} data - Report data
 * @property {'completed'|'pending'|'failed'} status - Report status
 * @property {string} generatedAt - Generation time (ISO 8601)
 * @property {string} accuracy - Data accuracy percentage
 */

export default {
  Member: {},
  AttendanceRecord: {},
  FinancialTransaction: {},
  Event: {},
  Message: {},
  Report: {}
};

