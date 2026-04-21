import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createPayment,
  checkPaymentStatus,
  registerIPN,
  getIPNList,
} from "../services/pesapal.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORDERS_FILE = path.join(__dirname, "..", "data", "orders.json");

const router = express.Router();

function readOrders() {
  if (!fs.existsSync(ORDERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function updateOrderPayment(merchantReference, fields) {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.pesapalMerchantReference === merchantReference);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...fields };
  writeOrders(orders);
  return orders[idx];
}

/**
 * POST /api/payments/initiate
 * Create a Pesapal payment session for an existing order.
 *
 * Body: { orderId, amount, currency, description, customerEmail,
 *         customerFirstName, customerLastName, customerPhone? }
 */
router.post("/initiate", async (req, res) => {
  const {
    orderId, amount, currency, description,
    customerEmail, customerFirstName, customerLastName, customerPhone,
  } = req.body;

  if (!orderId || !amount || !customerEmail || !customerFirstName || !customerLastName) {
    return res.status(400).json({
      success: false,
      error: "orderId, amount, customerEmail, customerFirstName and customerLastName are required",
    });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ success: false, error: "amount must be a positive number" });
  }

  try {
    const callbackUrl = process.env.PESAPAL_CALLBACK_URL;
    const ipnUrl = process.env.PESAPAL_IPN_URL;
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

    if (!callbackUrl || !ipnUrl || !consumerKey || !consumerSecret) {
      return res.status(503).json({
        success: false,
        error: "Payment service is not configured. Set PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET, PESAPAL_CALLBACK_URL, PESAPAL_IPN_URL in .env",
      });
    }

    // Resolve IPN notification_id (register once, reuse)
    let notificationId = process.env.PESAPAL_IPN_ID || "";
    if (!notificationId) {
      const ipnList = await getIPNList();
      if (Array.isArray(ipnList) && ipnList.length > 0) {
        notificationId = ipnList[0].ipn_id;
      } else {
        const ipnResult = await registerIPN(ipnUrl, "GET");
        notificationId = ipnResult?.ipn_id || "";
      }
    }

    const result = await createPayment({
      orderId,
      amount: parsedAmount,
      currency: currency || "KES",
      description: description || `Payment for order ${orderId}`,
      callbackUrl,
      notificationId,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone,
    });

    // Persist tracking IDs on the order
    const orders = readOrders();
    const idx = orders.findIndex((o) => String(o.id) === String(orderId));
    if (idx !== -1) {
      orders[idx].pesapalOrderTrackingId = result.order_tracking_id;
      orders[idx].pesapalMerchantReference = result.merchant_reference;
      orders[idx].pesapalTransactionStatus = "PENDING";
      writeOrders(orders);
    }

    return res.json({
      success: true,
      data: {
        redirectUrl: result.redirect_url,
        orderTrackingId: result.order_tracking_id,
        merchantReference: result.merchant_reference,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to initiate payment. Please try again.",
    });
  }
});

/**
 * GET /api/payments/callback
 * Pesapal redirects the user here after payment.
 * Query params: OrderTrackingId, OrderMerchantReference
 */
router.get("/callback", async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference } = req.query;

  if (!OrderTrackingId || !OrderMerchantReference) {
    return res.status(400).json({ success: false, error: "Missing callback parameters" });
  }

  try {
    const statusData = await checkPaymentStatus(OrderTrackingId);
    const paymentStatus = statusData?.payment_status_description?.toUpperCase() || "PENDING";

    updateOrderPayment(OrderMerchantReference, {
      pesapalTransactionStatus: paymentStatus,
      pesapalPaymentMethod: statusData?.payment_method || "",
      status: paymentStatus === "COMPLETED" ? "paid" : "pending",
    });

    return res.json({
      success: true,
      data: {
        status: paymentStatus,
        orderTrackingId: OrderTrackingId,
        merchantReference: OrderMerchantReference,
        amount: statusData?.amount,
        currency: statusData?.currency,
        paymentMethod: statusData?.payment_method,
        transactionDate: statusData?.created_date,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to verify payment status" });
  }
});

/**
 * GET /api/payments/ipn
 * IPN notification from Pesapal (status updates).
 * Pesapal sends: OrderNotificationType, OrderTrackingId, OrderMerchantReference
 */
router.get("/ipn", async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query;

  if (!OrderTrackingId || !OrderMerchantReference) {
    return res.status(400).json({ success: false, error: "Missing IPN parameters" });
  }

  try {
    const statusData = await checkPaymentStatus(OrderTrackingId);
    const paymentStatus = statusData?.payment_status_description?.toUpperCase() || "PENDING";

    updateOrderPayment(OrderMerchantReference, {
      pesapalTransactionStatus: paymentStatus,
      pesapalPaymentMethod: statusData?.payment_method || "",
      status: paymentStatus === "COMPLETED" ? "paid" : "pending",
    });

    return res.json({ orderNotificationType: OrderNotificationType, orderTrackingId: OrderTrackingId, orderMerchantReference: OrderMerchantReference });
  } catch (err) {
    return res.status(500).json({ success: false, error: "IPN processing failed" });
  }
});

/**
 * GET /api/payments/status/:orderTrackingId
 * On-demand payment status check (frontend polling).
 */
router.get("/status/:orderTrackingId", async (req, res) => {
  const { orderTrackingId } = req.params;

  try {
    const statusData = await checkPaymentStatus(orderTrackingId);
    const paymentStatus = statusData?.payment_status_description?.toUpperCase() || "PENDING";

    return res.json({
      success: true,
      data: {
        status: paymentStatus,
        amount: statusData?.amount,
        currency: statusData?.currency,
        paymentMethod: statusData?.payment_method,
        transactionDate: statusData?.created_date,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to retrieve payment status" });
  }
});

/**
 * POST /api/payments/register-ipn
 * One-time setup: register the IPN URL with Pesapal (admin use).
 */
router.post("/register-ipn", async (req, res) => {
  const ipnUrl = process.env.PESAPAL_IPN_URL;
  if (!ipnUrl) {
    return res.status(500).json({ success: false, error: "PESAPAL_IPN_URL not configured" });
  }

  try {
    const result = await registerIPN(ipnUrl, "GET");
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to register IPN URL" });
  }
});

export default router;
