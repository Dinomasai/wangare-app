import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";
import pesapalRouter from "./routes/pesapal.js";
import adminRouter from "./routes/admin.js";
import reelsRouter from "./routes/reels.js";
import ordersRouter from "./routes/orders.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/products", productsRouter);
  app.use("/api/reels", reelsRouter);
  app.use("/api/payments", pesapalRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/orders", ordersRouter);

  return app;
}
