import fs from "fs";
import path from "path";
import { getStore } from "@netlify/blobs";

const LOCAL_MODE = !process.env.NETLIFY_BLOBS_CONTEXT
  && !process.env.AWS_LAMBDA_FUNCTION_NAME
  && !process.env.LAMBDA_TASK_ROOT
  && process.env.NETLIFY !== "true"
  && process.env.USE_LOCAL_STORAGE !== "false";

// Location of bundled seed data/uploads inside the function package.
// netlify.toml `included_files = ["server/**"]` copies these to the function root.
function bundledServerDir() {
  const candidates = [
    path.join(process.cwd(), "server"),
    path.join(process.env.LAMBDA_TASK_ROOT || "", "server"),
    path.join(process.cwd(), "..", "..", "server"),
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch { /* ignore */ }
  }
  return candidates[0];
}

const localDataDir = () => path.join(bundledServerDir(), "data");
const localUploadsDir = () => path.join(bundledServerDir(), "uploads");

function localDataPath(key) {
  return path.join(localDataDir(), `${key}.json`);
}

function localUploadPath(key) {
  return path.join(localUploadsDir(), key);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function blobCreds() {
  const siteID = process.env.BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
  if (siteID && token) return { siteID, token };
  return null;
}

function dataStore() {
  const creds = blobCreds();
  return creds
    ? getStore({ name: "data", consistency: "strong", ...creds })
    : getStore({ name: "data", consistency: "strong" });
}

function uploadsStore() {
  const creds = blobCreds();
  return creds
    ? getStore({ name: "uploads", ...creds })
    : getStore({ name: "uploads" });
}

function readLocalJson(key, fallback) {
  const p = localDataPath(key);
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return fallback; }
}

function readLocalUpload(key) {
  const full = localUploadPath(key);
  try {
    if (!fs.existsSync(full)) return null;
    return { buffer: fs.readFileSync(full), contentType: null };
  } catch { return null; }
}

export async function readJson(key, fallback) {
  if (LOCAL_MODE) return readLocalJson(key, fallback);
  const value = await dataStore().get(key, { type: "json" });
  if (value !== null && value !== undefined) return value;
  // Not yet in Blobs — serve bundled seed data for a zero-setup first run.
  return readLocalJson(key, fallback);
}

export async function writeJson(key, value) {
  if (LOCAL_MODE) {
    ensureDir(localDataDir());
    fs.writeFileSync(localDataPath(key), JSON.stringify(value, null, 2));
    return;
  }
  await dataStore().setJSON(key, value);
}

export async function putUpload(key, buffer, contentType) {
  if (LOCAL_MODE) {
    const full = localUploadPath(key);
    ensureDir(path.dirname(full));
    fs.writeFileSync(full, buffer);
    return;
  }
  await uploadsStore().set(key, buffer, {
    metadata: { contentType: contentType || "application/octet-stream" },
  });
}

export async function getUpload(key) {
  if (LOCAL_MODE) return readLocalUpload(key);
  const result = await uploadsStore().getWithMetadata(key, { type: "arrayBuffer" });
  if (result) {
    return {
      buffer: Buffer.from(result.data),
      contentType: result.metadata?.contentType || null,
    };
  }
  // Fall back to bundled seed uploads.
  return readLocalUpload(key);
}

export async function deleteUpload(key) {
  if (LOCAL_MODE) {
    const full = localUploadPath(key);
    try { if (fs.existsSync(full)) fs.unlinkSync(full); } catch { /* ignore */ }
    return;
  }
  try { await uploadsStore().delete(key); } catch { /* ignore */ }
}

export function uploadKeyFromPath(urlPath) {
  if (!urlPath || !urlPath.startsWith("/uploads/")) return null;
  return urlPath.slice("/uploads/".length);
}
