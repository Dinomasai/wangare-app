#!/usr/bin/env node
// Seeds Netlify Blobs with the existing server/data/*.json and server/uploads/*
// Run with: netlify env:... (siteId injected) + node scripts/seed-blobs.js
// Or from Netlify CLI context: `netlify dev:exec node scripts/seed-blobs.js`

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { lookup as mimeLookup } from "mime-types";
import { getStore } from "@netlify/blobs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

const dataDir = path.join(root, "server", "data");
const uploadsDir = path.join(root, "server", "uploads");

function requireBlobsContext() {
  // When run via `netlify dev:exec`, NETLIFY_BLOBS_CONTEXT is populated.
  // When run from CI/CD with env vars, NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN work.
  if (process.env.NETLIFY_BLOBS_CONTEXT) return;
  if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) return;
  console.error("Missing Netlify Blobs context. Run via: netlify dev:exec node scripts/seed-blobs.js");
  console.error("Or export NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN.");
  process.exit(1);
}

function getStoreWithCreds(name, opts = {}) {
  if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
    return getStore({
      name,
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN,
      ...opts,
    });
  }
  return getStore({ name, ...opts });
}

async function seedData() {
  if (!fs.existsSync(dataDir)) return;
  const store = getStoreWithCreds("data", { consistency: "strong" });
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    const key = path.basename(f, ".json");
    const value = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf-8"));
    await store.setJSON(key, value);
    console.log(`[data] seeded ${key}`);
  }
}

async function walk(dir, base = "") {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    const rel = base ? `${base}/${name}` : name;
    if (stat.isDirectory()) {
      out.push(...(await walk(full, rel)));
    } else {
      out.push({ full, key: rel });
    }
  }
  return out;
}

async function seedUploads() {
  if (!fs.existsSync(uploadsDir)) return;
  const store = getStoreWithCreds("uploads");
  const files = await walk(uploadsDir);
  for (const { full, key } of files) {
    const buf = fs.readFileSync(full);
    const contentType = mimeLookup(full) || "application/octet-stream";
    await store.set(key, buf, { metadata: { contentType } });
    console.log(`[uploads] seeded ${key} (${buf.length} bytes)`);
  }
}

async function main() {
  requireBlobsContext();
  await seedData();
  await seedUploads();
  console.log("Seed complete.");
}

main().catch((err) => { console.error(err); process.exit(1); });
