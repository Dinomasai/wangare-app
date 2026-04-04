import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { verifyToken } from "./admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "data", "orders.json");

const router = express.Router();

function readOrders() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeOrders(orders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
}

// POST - Create order (public — called from checkout)
router.post("/", (req, res) => {
  const { customer, items, total, paymentMethod } = req.body;

  if (!customer || !items || !total) {
    return res.status(400).json({ error: "Missing order data" });
  }

  const orders = readOrders();
  const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1;

  const order = {
    id: newId,
    customer, // { name, phone, location }
    items,    // [{ id, name, price, qty, color, size }]
    total,
    paymentMethod: paymentMethod || "pesapal",
    status: "pending",
    pesapalOrderTrackingId: null,
    pesapalMerchantReference: null,
    pesapalTransactionStatus: null,
    pesapalPaymentMethod: null,
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  writeOrders(orders);
  res.status(201).json(order);
});

// GET - All orders (admin only)
router.get("/", verifyToken, (req, res) => {
  const orders = readOrders().reverse(); // newest first
  res.json(orders);
});

// PUT - Update order status (admin only)
router.put("/:id", verifyToken, (req, res) => {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Order not found" });

  const { status } = req.body;
  if (status) orders[idx].status = status;

  writeOrders(orders);
  res.json(orders[idx]);
});

// DELETE - Delete order (admin only)
router.delete("/:id", verifyToken, (req, res) => {
  let orders = readOrders();
  orders = orders.filter((o) => o.id !== Number(req.params.id));
  writeOrders(orders);
  res.json({ message: "Order deleted" });
});

export default router;
