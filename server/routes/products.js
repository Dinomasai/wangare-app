import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { verifyToken } from "./admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "data", "products.json");

const router = express.Router();

// Image upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${unique}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

function readProducts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

// GET all products (public)
router.get("/", (req, res) => {
  const products = readProducts();
  const { category } = req.query;
  if (category && category !== "all") {
    return res.json(products.filter((p) => p.category === category));
  }
  res.json(products);
});

// GET single product (public)
router.get("/:id", (req, res) => {
  const products = readProducts();
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// POST create product (admin only)
router.post("/", verifyToken, upload.array("images", 8), (req, res) => {
  const products = readProducts();
  const { name, price, category, description, colors, sizes, featured, newArrival } = req.body;

  const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

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
  writeProducts(products);
  res.status(201).json(product);
});

// PUT update product (admin only)
router.put("/:id", verifyToken, upload.array("images", 8), (req, res) => {
  const products = readProducts();
  const idx = products.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  const { name, price, category, description, colors, sizes, featured, newArrival, existingImages } = req.body;

  let images = existingImages ? JSON.parse(existingImages) : products[idx].images;
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => `/uploads/${f.filename}`);
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

  writeProducts(products);
  res.json(products[idx]);
});

// DELETE product (admin only)
router.delete("/:id", verifyToken, (req, res) => {
  let products = readProducts();
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });

  // Delete associated images
  product.images.forEach((img) => {
    if (!img || !img.startsWith("/uploads/")) return;
    const imgPath = path.join(__dirname, "..", img);
    try {
      if (fs.existsSync(imgPath) && fs.statSync(imgPath).isFile()) fs.unlinkSync(imgPath);
    } catch { /* ignore */ }
  });

  products = products.filter((p) => p.id !== Number(req.params.id));
  writeProducts(products);
  res.json({ message: "Product deleted" });
});

// DELETE single image from product (admin only)
router.delete("/:id/image", verifyToken, (req, res) => {
  const products = readProducts();
  const idx = products.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  const { imagePath } = req.body;
  if (!imagePath || !imagePath.startsWith("/uploads/")) {
    return res.status(400).json({ error: "Invalid image path" });
  }
  products[idx].images = products[idx].images.filter((img) => img !== imagePath);

  const imgFile = path.join(__dirname, "..", imagePath);
  try {
    if (fs.existsSync(imgFile) && fs.statSync(imgFile).isFile()) fs.unlinkSync(imgFile);
  } catch { /* ignore */ }

  writeProducts(products);
  res.json(products[idx]);
});

export default router;
