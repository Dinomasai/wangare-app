/**
 * @typedef {Object} PaymentInitiateRequest
 * @property {string} orderId
 * @property {number} amount
 * @property {string} currency
 * @property {string} description
 * @property {string} customerEmail
 * @property {string} customerFirstName
 * @property {string} customerLastName
 * @property {string} [customerPhone]
 */

/**
 * @typedef {Object} PaymentInitiateResponse
 * @property {boolean} success
 * @property {{ redirectUrl: string, orderTrackingId: string, merchantReference: string }} [data]
 * @property {string} [error]
 */

/**
 * @typedef {'COMPLETED'|'PENDING'|'FAILED'|'CANCELLED'} PaymentStatus
 */

/**
 * @typedef {Object} PaymentStatusResponse
 * @property {boolean} success
 * @property {{ status: PaymentStatus, amount: number, currency: string, paymentMethod: string, transactionDate: string }} [data]
 * @property {string} [error]
 */
