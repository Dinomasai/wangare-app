import express from "express";
import path from "path";
import multer from "multer";
import { verifyToken } from "./admin.js";
import { readJson, writeJson, putUpload, deleteUpload, uploadKeyFromPath } from "../storage.js";

const REELS_KEY = "reels";
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

async function persistMedia(file) {
  if (!file) return null;
  const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const key = `reels/reel-${unique}${ext}`;
  await putUpload(key, file.buffer, file.mimetype);
  return { url: `/uploads/${key}`, mimetype: file.mimetype };
}

router.get("/", async (req, res) => {
  res.json(await readJson(REELS_KEY, []));
});

router.post("/", verifyToken, upload.single("media"), async (req, res) => {
  const reels = await readJson(REELS_KEY, []);
  const { productId, tag, caption } = req.body;
  const newId = reels.length > 0 ? Math.max(...reels.map((r) => r.id)) + 1 : 1;

  const stored = await persistMedia(req.file);

  const reel = {
    id: newId,
    media: stored?.url || "",
    mediaType: stored?.mimetype?.startsWith("video") ? "video" : "image",
    productId: productId ? Number(productId) : null,
    tag: tag || "New Drop",
    caption: caption || "",
    createdAt: new Date().toISOString(),
  };

  reels.push(reel);
  await writeJson(REELS_KEY, reels);
  res.status(201).json(reel);
});

router.put("/:id", verifyToken, upload.single("media"), async (req, res) => {
  const reels = await readJson(REELS_KEY, []);
  const idx = reels.findIndex((r) => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Reel not found" });

  const { productId, tag, caption } = req.body;

  if (req.file) {
    const oldKey = uploadKeyFromPath(reels[idx].media);
    if (oldKey) await deleteUpload(oldKey);
    const stored = await persistMedia(req.file);
    reels[idx].media = stored.url;
    reels[idx].mediaType = stored.mimetype.startsWith("video") ? "video" : "image";
  }

  if (productId !== undefined) reels[idx].productId = productId ? Number(productId) : null;
  if (tag !== undefined) reels[idx].tag = tag;
  if (caption !== undefined) reels[idx].caption = caption;

  await writeJson(REELS_KEY, reels);
  res.json(reels[idx]);
});

router.delete("/:id", verifyToken, async (req, res) => {
  let reels = await readJson(REELS_KEY, []);
  const reel = reels.find((r) => r.id === Number(req.params.id));
  if (!reel) return res.status(404).json({ error: "Reel not found" });

  const key = uploadKeyFromPath(reel.media);
  if (key) await deleteUpload(key);

  reels = reels.filter((r) => r.id !== Number(req.params.id));
  await writeJson(REELS_KEY, reels);
  res.json({ message: "Reel deleted" });
});

export default router;
