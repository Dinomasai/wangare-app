import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/products.js";
import mpesaRouter from "./routes/mpesa.js";
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
app.use("/api/mpesa", mpesaRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", ordersRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
