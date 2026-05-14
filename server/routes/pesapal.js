import express from "express";
import {
  createPayment,
  checkPaymentStatus,
  registerIPN,
  getIPNList,
} from "../services/pesapal.service.js";
import { sendPaymentReceivedEmail } from "../services/notifications.service.js";
import { readJson, writeJson } from "../storage.js";

const ORDERS_KEY = "orders";
const PROGRESSED_STATUSES = new Set(["confirmed", "delivered"]);
const router = express.Router();

// Centralised payment status reconciliation. Idempotent against repeated IPN/callback
// hits — the admin email fires only on the first transition into "paid".
async function reconcilePayment(merchantReference, orderTrackingId) {
  const statusData = await checkPaymentStatus(orderTrackingId);
  const paymentStatus = statusData?.payment_status_description?.toUpperCase() || "PENDING";

  const orders = await readJson(ORDERS_KEY, []);
  const idx = orders.findIndex((o) => o.pesapalMerchantReference === merchantReference);
  if (idx === -1) return { statusData, paymentStatus, order: null };

  const previous = orders[idx];
  const wasPaid = previous.status === "paid";
  const adminProgressed = PROGRESSED_STATUSES.has(previous.status);
  const isCompleted = paymentStatus === "COMPLETED";

  let nextStatus = previous.status;
  if (isCompleted && !adminProgressed && !wasPaid) nextStatus = "paid";
  else if (!isCompleted && previous.status === "pending") nextStatus = "pending";

  const updated = {
    ...previous,
    pesapalTransactionStatus: paymentStatus,
    pesapalPaymentMethod: statusData?.payment_method || previous.pesapalPaymentMethod || "",
    status: nextStatus,
  };
  orders[idx] = updated;
  await writeJson(ORDERS_KEY, orders);

  if (isCompleted && !wasPaid && !adminProgressed) {
    sendPaymentReceivedEmail(updated, statusData).catch((err) =>
      console.error("[pesapal] notification dispatch failed", err)
    );
  }

  return { statusData, paymentStatus, order: updated };
}

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
        error: "Payment service is not configured. Set PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET, PESAPAL_CALLBACK_URL, PESAPAL_IPN_URL",
      });
    }

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

    const orders = await readJson(ORDERS_KEY, []);
    const idx = orders.findIndex((o) => String(o.id) === String(orderId));
    if (idx !== -1) {
      orders[idx].pesapalOrderTrackingId = result.order_tracking_id;
      orders[idx].pesapalMerchantReference = result.merchant_reference;
      orders[idx].pesapalTransactionStatus = "PENDING";
      await writeJson(ORDERS_KEY, orders);
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
    console.error("[pesapal initiate] error:", err?.message || err, err?.response?.data || "");
    return res.status(500).json({
      success: false,
      error: "Failed to initiate payment. Please try again.",
      debug: process.env.PESAPAL_DEBUG === "1" ? {
        message: String(err?.message || err),
        data: err?.response?.data || null,
      } : undefined,
    });
  }
});

router.get("/callback", async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference } = req.query;
  if (!OrderTrackingId || !OrderMerchantReference) {
    return res.status(400).json({ success: false, error: "Missing callback parameters" });
  }

  try {
    const { statusData, paymentStatus } = await reconcilePayment(OrderMerchantReference, OrderTrackingId);
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

router.get("/ipn", async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query;
  if (!OrderTrackingId || !OrderMerchantReference) {
    return res.status(400).json({ success: false, error: "Missing IPN parameters" });
  }

  try {
    await reconcilePayment(OrderMerchantReference, OrderTrackingId);
    return res.json({
      orderNotificationType: OrderNotificationType,
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "IPN processing failed" });
  }
});

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
