import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createApp } from "./app.js";
import { getUpload } from "./storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createApp();
const PORT = process.env.PORT || 4000;

app.get(/^\/uploads\/(.+)/, async (req, res) => {
  const key = req.params[0];
  const file = await getUpload(key);
  if (!file) return res.status(404).end();
  if (file.contentType) res.setHeader("Content-Type", file.contentType);
  res.send(file.buffer);
});

const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^\/(?!api|uploads).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const missingPesapal = ["PESAPAL_CONSUMER_KEY", "PESAPAL_CONSUMER_SECRET", "PESAPAL_CALLBACK_URL", "PESAPAL_IPN_URL"]
  .filter((k) => !process.env[k]);
if (missingPesapal.length) {
  console.warn(`[warn] Pesapal disabled — missing env vars: ${missingPesapal.join(", ")}`);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
