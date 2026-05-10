import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { readJson, writeJson } from "../storage.js";

const JWT_SECRET = process.env.JWT_SECRET || "wangare-luxe-secret-key-change-this";
const ADMIN_KEY = "admin";

const router = express.Router();

async function getAdmin() {
  let admin = await readJson(ADMIN_KEY, null);
  if (!admin) {
    admin = { username: "admin", password: bcrypt.hashSync("admin123", 10) };
    await writeJson(ADMIN_KEY, admin);
  }
  return admin;
}

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

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await getAdmin();

  if (username !== admin.username || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, username });
});

router.put("/password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await getAdmin();

  if (!bcrypt.compareSync(currentPassword, admin.password)) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  admin.password = bcrypt.hashSync(newPassword, 10);
  await writeJson(ADMIN_KEY, admin);
  res.json({ message: "Password updated" });
});

router.get("/verify", verifyToken, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

export default router;
