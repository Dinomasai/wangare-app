import express from "express";
import path from "path";
import multer from "multer";
import { verifyToken } from "./admin.js";
import { readJson, writeJson, putUpload, deleteUpload, uploadKeyFromPath } from "../storage.js";

const PRODUCTS_KEY = "products";
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

async function persistFiles(files, prefix) {
  if (!files || files.length === 0) return [];
  const urls = [];
  for (const file of files) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const key = `${prefix}-${unique}${ext}`;
    await putUpload(key, file.buffer, file.mimetype);
    urls.push(`/uploads/${key}`);
  }
  return urls;
}

router.get("/", async (req, res) => {
  const products = await readJson(PRODUCTS_KEY, []);
  const { category } = req.query;
  if (category && category !== "all") {
    return res.json(products.filter((p) => p.category === category));
  }
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const products = await readJson(PRODUCTS_KEY, []);
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

router.post("/", verifyToken, upload.array("images", 8), async (req, res) => {
  const products = await readJson(PRODUCTS_KEY, []);
  const { name, price, category, description, colors, sizes, featured, newArrival } = req.body;

  const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const images = await persistFiles(req.files, "product");

  const product = {
    id: newId,
    name,
    price: Number(price),
    category,
    description,
    images,
    colors: colors ? JSON.parse(colors) : [],
    sizes: sizes ? JSON.parse(sizes) : [],
    featured: featured === "true",
    newArrival: newArrival === "true",
  };

  products.push(product);
  await writeJson(PRODUCTS_KEY, products);
  res.status(201).json(product);
});

router.put("/:id", verifyToken, upload.array("images", 8), async (req, res) => {
  const products = await readJson(PRODUCTS_KEY, []);
  const idx = products.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  const { name, price, category, description, colors, sizes, featured, newArrival, existingImages } = req.body;

  let images = existingImages ? JSON.parse(existingImages) : products[idx].images;
  if (req.files && req.files.length > 0) {
    const newImages = await persistFiles(req.files, "product");
    images = [...images, ...newImages];
  }

  products[idx] = {
    ...products[idx],
    name: name || products[idx].name,
    price: price ? Number(price) : products[idx].price,
    category: category || products[idx].category,
    description: description || products[idx].description,
    images,
    colors: colors ? JSON.parse(colors) : products[idx].colors,
    sizes: sizes ? JSON.parse(sizes) : products[idx].sizes,
    featured: featured !== undefined ? featured === "true" : products[idx].featured,
    newArrival: newArrival !== undefined ? newArrival === "true" : products[idx].newArrival,
  };

  await writeJson(PRODUCTS_KEY, products);
  res.json(products[idx]);
});

router.delete("/:id", verifyToken, async (req, res) => {
  let products = await readJson(PRODUCTS_KEY, []);
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });

  for (const img of product.images || []) {
    const key = uploadKeyFromPath(img);
    if (key) await deleteUpload(key);
  }

  products = products.filter((p) => p.id !== Number(req.params.id));
  await writeJson(PRODUCTS_KEY, products);
  res.json({ message: "Product deleted" });
});

router.delete("/:id/image", verifyToken, async (req, res) => {
  const products = await readJson(PRODUCTS_KEY, []);
  const idx = products.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  const { imagePath } = req.body;
  const key = uploadKeyFromPath(imagePath);
  if (!key) return res.status(400).json({ error: "Invalid image path" });

  products[idx].images = products[idx].images.filter((img) => img !== imagePath);
  await deleteUpload(key);
  await writeJson(PRODUCTS_KEY, products);
  res.json(products[idx]);
});

export default router;
