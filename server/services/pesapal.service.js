// Direct Pesapal v3 REST API client. We don't use pesapaljs-v3 because its
// internal/core.js has bugs: registerIPNurl sends `url: ipn_notification_type`
// (so the IPN URL gets clobbered with the notification type), and get_ipn_list
// requires params it doesn't use. Talking to the API ourselves is shorter,
// debuggable, and the surface is small (5 endpoints).

const IS_SANDBOX = (process.env.PESAPAL_ENV || "sandbox") !== "live";
const BASE_URL = IS_SANDBOX
  ? "https://cybqa.pesapal.com/pesapalv3"
  : "https://pay.pesapal.com/v3";

let cachedToken = null;
let tokenExpiresAt = 0;

class PesapalError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "PesapalError";
    this.status = status;
    this.response = { data: body };
  }
}

async function authenticate() {
  const key = process.env.PESAPAL_CONSUMER_KEY;
  const secret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new PesapalError("PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET must be set");
  }

  const res = await fetch(`${BASE_URL}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });
  const body = await safeJson(res);
  if (!res.ok || !body?.token) {
    throw new PesapalError(`Pesapal auth failed (${res.status})`, { status: res.status, body });
  }
  cachedToken = body.token;
  // Pesapal tokens are valid for 5 minutes — refresh 30s before expiry.
  tokenExpiresAt = Date.now() + (5 * 60 - 30) * 1000;
  return cachedToken;
}

async function getValidToken() {
  if (!cachedToken || Date.now() >= tokenExpiresAt) {
    await authenticate();
  }
  return cachedToken;
}

async function call(path, { method = "GET", body, query } = {}) {
  const token = await getValidToken();
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const parsed = await safeJson(res);
  if (!res.ok) {
    throw new PesapalError(`Pesapal ${method} ${path} failed (${res.status})`, {
      status: res.status,
      body: parsed,
    });
  }
  // Pesapal sometimes returns 200 with an error envelope: { status: "500", error: {...} }
  if (parsed && parsed.error && (parsed.status === "500" || parsed.error.code)) {
    throw new PesapalError(parsed.error.message || `Pesapal returned error envelope`, {
      status: 200,
      body: parsed,
    });
  }
  return parsed;
}

async function safeJson(res) {
  try { return await res.json(); }
  catch { return null; }
}

export async function registerIPN(ipnUrl, notificationType = "GET") {
  return call("/api/URLSetup/RegisterIPN", {
    method: "POST",
    body: { url: ipnUrl, ipn_notification_type: notificationType },
  });
}

export async function getIPNList() {
  return call("/api/URLSetup/GetIpnList", { method: "GET" });
}

export async function createPayment(orderDetails) {
  const {
    orderId, amount, currency, description,
    callbackUrl, notificationId,
    customerEmail, customerFirstName, customerLastName, customerPhone,
  } = orderDetails;

  return call("/api/Transactions/SubmitOrderRequest", {
    method: "POST",
    body: {
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
    },
  });
}

export async function checkPaymentStatus(orderTrackingId) {
  return call("/api/Transactions/GetTransactionStatus", {
    method: "GET",
    query: { orderTrackingId },
  });
}

export async function initializePesapal() {
  await getValidToken();
}
