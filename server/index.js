import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/products.js";
import pesapalRouter from "./routes/pesapal.js";
import adminRouter from "./routes/admin.js";
import reelsRouter from "./routes/reels.js";
import ordersRouter from "./routes/orders.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/products", productsRouter);
app.use("/api/reels", reelsRouter);
app.use("/api/payments", pesapalRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", ordersRouter);

// Serve built frontend (dist/) if present — lets `node server/index.js`
// run the whole app without a separate Vite dev server.
const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^\/(?!api|uploads).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Startup checks — surface config issues instead of failing silently at request time.
const missingPesapal = ["PESAPAL_CONSUMER_KEY", "PESAPAL_CONSUMER_SECRET", "PESAPAL_CALLBACK_URL", "PESAPAL_IPN_URL"]
  .filter((k) => !process.env[k]);
if (missingPesapal.length) {
  console.warn(`[warn] Pesapal disabled — missing env vars: ${missingPesapal.join(", ")}. Checkout will fail until these are set.`);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
