import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ADMIN_FILE = path.join(__dirname, "..", "data", "admin.json");
const JWT_SECRET = process.env.JWT_SECRET || "wangare-luxe-secret-key-change-this";

const router = express.Router();

// Initialize admin account if not exists
function initAdmin() {
  if (!fs.existsSync(ADMIN_FILE)) {
    const hash = bcrypt.hashSync("admin123", 10);
    fs.writeFileSync(
      ADMIN_FILE,
      JSON.stringify({ username: "admin", password: hash }, null, 2)
    );
  }
}
initAdmin();

// Middleware to verify JWT
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// POST login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));

  if (username !== admin.username || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, username });
});

// PUT change password (admin only)
router.put("/password", verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));

  if (!bcrypt.compareSync(currentPassword, admin.password)) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  admin.password = bcrypt.hashSync(newPassword, 10);
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2));
  res.json({ message: "Password updated" });
});

// GET verify token
router.get("/verify", verifyToken, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

export default router;
