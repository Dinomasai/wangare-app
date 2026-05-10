import express from "express";
import { verifyToken } from "./admin.js";
import { readJson, writeJson } from "../storage.js";

const ORDERS_KEY = "orders";
const router = express.Router();

router.post("/", async (req, res) => {
  const { customer, items, total, paymentMethod } = req.body;

  if (!customer || !items || !total) {
    return res.status(400).json({ error: "Missing order data" });
  }

  const orders = await readJson(ORDERS_KEY, []);
  const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1;

  const order = {
    id: newId,
    customer,
    items,
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
  await writeJson(ORDERS_KEY, orders);
  res.status(201).json(order);
});

router.get("/", verifyToken, async (req, res) => {
  const orders = (await readJson(ORDERS_KEY, [])).reverse();
  res.json(orders);
});

router.put("/:id", verifyToken, async (req, res) => {
  const orders = await readJson(ORDERS_KEY, []);
  const idx = orders.findIndex((o) => o.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Order not found" });

  const { status } = req.body;
  if (status) orders[idx].status = status;

  await writeJson(ORDERS_KEY, orders);
  res.json(orders[idx]);
});

router.delete("/:id", verifyToken, async (req, res) => {
  let orders = await readJson(ORDERS_KEY, []);
  orders = orders.filter((o) => o.id !== Number(req.params.id));
  await writeJson(ORDERS_KEY, orders);
  res.json({ message: "Order deleted" });
});

export default router;
