import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { verifyToken } from "./admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "data", "reels.json");

const router = express.Router();

// Video/image upload config for reels
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads", "reels");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `reel-${unique}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

function readReels() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeReels(reels) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reels, null, 2));
}

// GET all reels (public)
router.get("/", (req, res) => {
  res.json(readReels());
});

// POST create reel (admin only)
router.post("/", verifyToken, upload.single("media"), (req, res) => {
  const reels = readReels();
  const { productId, tag, caption } = req.body;
  const newId = reels.length > 0 ? Math.max(...reels.map((r) => r.id)) + 1 : 1;

  const reel = {
    id: newId,
    media: req.file ? `/uploads/reels/${req.file.filename}` : "",
    mediaType: req.file?.mimetype.startsWith("video") ? "video" : "image",
    productId: productId ? Number(productId) : null,
    tag: tag || "New Drop",
    caption: caption || "",
    createdAt: new Date().toISOString(),
  };

  reels.push(reel);
  writeReels(reels);
  res.status(201).json(reel);
});

// PUT update reel (admin only)
router.put("/:id", verifyToken, upload.single("media"), (req, res) => {
  const reels = readReels();
  const idx = reels.findIndex((r) => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Reel not found" });

  const { productId, tag, caption } = req.body;

  if (req.file) {
    // Delete old media
    if (reels[idx].media && reels[idx].media.startsWith("/uploads/")) {
      const oldPath = path.join(__dirname, "..", reels[idx].media);
      try {
        if (fs.existsSync(oldPath) && fs.statSync(oldPath).isFile()) fs.unlinkSync(oldPath);
      } catch { /* ignore */ }
    }
    reels[idx].media = `/uploads/reels/${req.file.filename}`;
    reels[idx].mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
  }

  if (productId !== undefined) reels[idx].productId = productId ? Number(productId) : null;
  if (tag !== undefined) reels[idx].tag = tag;
  if (caption !== undefined) reels[idx].caption = caption;

  writeReels(reels);
  res.json(reels[idx]);
});

// DELETE reel (admin only)
router.delete("/:id", verifyToken, (req, res) => {
  let reels = readReels();
  const reel = reels.find((r) => r.id === Number(req.params.id));
  if (!reel) return res.status(404).json({ error: "Reel not found" });

  if (reel.media && reel.media.startsWith("/uploads/")) {
    const mediaPath = path.join(__dirname, "..", reel.media);
    try {
      if (fs.existsSync(mediaPath) && fs.statSync(mediaPath).isFile()) fs.unlinkSync(mediaPath);
    } catch { /* ignore */ }
  }

  reels = reels.filter((r) => r.id !== Number(req.params.id));
  writeReels(reels);
  res.json({ message: "Reel deleted" });
});

export default router;
