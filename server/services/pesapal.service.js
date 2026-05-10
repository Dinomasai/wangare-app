import pesapal from "pesapaljs-v3";

const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const IS_SANDBOX = (process.env.PESAPAL_ENV || "sandbox") !== "live";

let pesapalInstance = null;
let tokenExpiresAt = 0;

/**
 * Initialize Pesapal SDK and authenticate.
 * Tokens expire in ~5 minutes — re-authenticates automatically.
 */
async function initializePesapal() {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error("PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET must be set");
  }

  if (!pesapalInstance) {
    pesapalInstance = pesapal.init({
      key: CONSUMER_KEY,
      secret: CONSUMER_SECRET,
      debug: IS_SANDBOX,
    });
  }

  // Re-authenticate if token is expired or about to expire (30s buffer)
  if (Date.now() >= tokenExpiresAt - 30_000) {
    await pesapalInstance.authenticate();
    // Pesapal tokens are valid for 5 minutes
    tokenExpiresAt = Date.now() + 5 * 60 * 1000;
  }

  return pesapalInstance;
}

/**
 * Register the IPN callback URL with Pesapal.
 * @param {string} ipnUrl - Publicly accessible URL for IPN notifications
 * @param {"GET"|"POST"} notificationType
 * @returns {Promise<{ipn_id: string}>}
 */
async function registerIPN(ipnUrl, notificationType = "GET") {
  const instance = await initializePesapal();
  return instance.register_ipn_url({ url: ipnUrl, ipn_notification_type: notificationType });
}

/**
 * Fetch the list of registered IPN URLs.
 * @returns {Promise<Array>}
 */
async function getIPNList() {
  const instance = await initializePesapal();
  return instance.get_ipn_list({ url: "", ipn_notification_type: "" });
}

/**
 * Create a Pesapal payment order.
 * @param {{
 *   orderId: string,
 *   amount: number,
 *   currency: string,
 *   description: string,
 *   callbackUrl: string,
 *   notificationId: string,
 *   customerEmail: string,
 *   customerFirstName: string,
 *   customerLastName: string,
 *   customerPhone?: string,
 * }} orderDetails
 * @returns {Promise<{order_tracking_id: string, merchant_reference: string, redirect_url: string}>}
 */
async function createPayment(orderDetails) {
  const instance = await initializePesapal();

  const {
    orderId, amount, currency, description,
    callbackUrl, notificationId,
    customerEmail, customerFirstName, customerLastName, customerPhone,
  } = orderDetails;

  return instance.submit_order({
    id: orderId,
    currency: currency || "KES",
    amount,
    description,
    callback_url: callbackUrl,
    notification_id: notificationId,
    billing_address: {
      email_address: customerEmail || "",
      phone_number: customerPhone || "",
      country_code: "KE",
      first_name: customerFirstName || "",
      middle_name: "",
      last_name: customerLastName || "",
      line_1: "",
      line_2: "",
      city: "",
      state: "",
      postal_code: null,
      zip_code: null,
    },
  });
}

/**
 * Query the status of a Pesapal transaction.
 * @param {string} orderTrackingId
 * @returns {Promise<{payment_status_description: string, amount: number, currency: string, ...}>}
 */
async function checkPaymentStatus(orderTrackingId) {
  const instance = await initializePesapal();
  return instance.get_transaction_status({ OrderTrackingId: orderTrackingId });
}

export { initializePesapal, registerIPN, getIPNList, createPayment, checkPaymentStatus };
