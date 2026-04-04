import express from "express";
import axios from "axios";

const router = express.Router();

// M-PESA Daraja API credentials — update these with your actual credentials
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "YOUR_CONSUMER_KEY";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "YOUR_CONSUMER_SECRET";
const SHORTCODE = process.env.MPESA_SHORTCODE || "174379"; // Sandbox shortcode
const PASSKEY = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"; // Sandbox passkey
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "https://yourdomain.com/api/mpesa/callback";
const BASE_URL = process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke"; // Change to https://api.safaricom.co.ke for production

// Get OAuth token
async function getAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const { data } = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return data.access_token;
}

// POST - Initiate STK Push
router.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: "Phone number and amount are required" });
    }

    // Format phone number (ensure 254XXXXXXXXX format)
    let formattedPhone = phone.replace(/\s+/g, "").replace(/^0/, "254").replace(/^\+/, "");
    if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBuyGoodsOnline",
        Amount: Math.ceil(amount),
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: `WangareLuxe-${orderId || "Order"}`,
        TransactionDesc: `Payment for Wangaré Luxe order`,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json({
      success: true,
      message: "STK push sent. Check your phone to complete payment.",
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
    });
  } catch (error) {
    console.error("M-PESA STK Push Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to initiate M-PESA payment",
      details: error.response?.data?.errorMessage || error.message,
    });
  }
});

// POST - M-PESA callback
router.post("/callback", (req, res) => {
  const { Body } = req.body;
  console.log("M-PESA Callback:", JSON.stringify(Body, null, 2));

  if (Body.stkCallback.ResultCode === 0) {
    const items = Body.stkCallback.CallbackMetadata.Item;
    const payment = {
      amount: items.find((i) => i.Name === "Amount")?.Value,
      receipt: items.find((i) => i.Name === "MpesaReceiptNumber")?.Value,
      phone: items.find((i) => i.Name === "PhoneNumber")?.Value,
      date: items.find((i) => i.Name === "TransactionDate")?.Value,
    };
    console.log("Payment successful:", payment);
    // You can store this in a payments.json file or database
  } else {
    console.log("Payment failed:", Body.stkCallback.ResultDesc);
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// POST - Check STK push status
router.post("/query", async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;
    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to query payment status" });
  }
});

export default router;
