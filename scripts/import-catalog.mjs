import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.resolve(ROOT, "..", "wangare");
const UPLOADS = path.join(ROOT, "server", "uploads");
const PRODUCTS_JSON = path.join(ROOT, "server", "data", "products.json");

function parseName(filename) {
  const m = filename.match(/at (\d{2})\.(\d{2})\.(\d{2})(?:\s\((\d+)\))?\.jpe?g$/i);
  if (!m) return null;
  return {
    cluster: `${m[1]}.${m[2]}`,
    second: parseInt(m[3], 10),
    variant: m[4] ? parseInt(m[4], 10) : 0,
    key: `${m[1]}.${m[2]}.${m[3]}`,
  };
}

function categoryFor(parsed) {
  if (parsed.cluster === "10.26") return "sunglasses";
  if (parsed.cluster === "10.29") return "watches";
  if (parsed.cluster === "10.35") return "jewelry";
  if (parsed.cluster === "10.37") return parsed.second <= 28 ? "jewelry" : "bags";
  return null;
}

const NAME_POOL = {
  sunglasses: [
    "Tinted Square Shades", "Cat-Eye Sunglasses", "Round Frame Shades",
    "Oversized Black Shades", "Classic Aviator", "Retro Browline Shades",
    "Bold Hexagon Shades", "Slim Rectangle Frames", "Vintage Round Shades",
    "Designer Cat-Eye", "Modern Square Frames", "Pearl-Accent Shades",
    "Mirror Lens Aviator", "Two-Tone Shades", "Statement Oval Frames",
  ],
  watches: [
    "Casio G-Shock Sport", "Classic Leather Watch", "Rose Gold Chronograph",
    "Dual-Time Sport Watch", "Vintage Dial Watch", "Steel Bracelet Watch",
    "Military Field Watch", "Minimalist Dress Watch", "Chunky Resin Watch",
    "Gold Tone Chronograph", "Black Stealth Watch", "Silver Mesh Watch",
    "Crimson Dial Watch", "Olive Tactical Watch", "Two-Tone Steel Watch",
  ],
  jewelry: [
    "Enamel Flower Ring", "Statement Cocktail Ring", "Stacked Stone Rings",
    "Pearl Cluster Ring", "Geometric Gold Ring", "Floral Enamel Ring",
    "Bold Heart Ring", "Crystal Halo Ring", "Mixed-Stone Ring Set",
    "Vintage Signet Ring", "Charm Bracelet Set", "Layered Gold Bracelet",
    "Tennis Bracelet", "Clover Link Bracelet", "Cuban Chain Bracelet",
    "Beaded Gold Bracelet", "Heart Pendant Necklace", "Double Chain Necklace",
    "Initial Charm Necklace", "Layered Coin Necklace", "Crystal Drop Necklace",
    "Gold Pendant Necklace", "Choker Chain Set", "Pearl Strand Necklace",
    "Y-Drop Lariat Necklace",
  ],
  bags: [
    "YSL-Style Hobo Bag", "Quilted Chain Shoulder Bag", "Fur-Trim Mini Bag",
    "Croc-Embossed Crossbody", "Patent Leather Tote", "Structured Top Handle",
    "Soft Hobo Shoulder Bag", "Chain-Strap Flap Bag", "Bucket Drawstring Bag",
    "Mini Box Crossbody", "Pearl-Handle Clutch", "Saddle Bag with Tassel",
    "Woven Leather Tote", "Padded Puffer Bag",
  ],
};

const PRICE_RANGES = {
  sunglasses: [1200, 2500],
  watches:    [1800, 4500],
  jewelry:    [800, 2800],
  bags:       [2200, 5500],
};

const DESCRIPTIONS = {
  sunglasses: "Polished frames with UV-protective lenses. The finishing touch every Wangaré outfit deserves.",
  watches:    "Precision movement set in a statement case. Built to be worn every day, styled for any occasion.",
  jewelry:    "Crafted from hypoallergenic alloy with a lasting gold-tone finish. Layer it, stack it, gift it.",
  bags:       "Structured silhouette, refined hardware. A piece that elevates jeans-and-tee just as easily as evening wear.",
};

function priceFor(category, idx) {
  const [lo, hi] = PRICE_RANGES[category];
  const step = Math.floor((hi - lo) / Math.max(1, NAME_POOL[category].length - 1));
  const raw = lo + step * idx;
  return Math.round(raw / 100) * 100;
}

function nameFor(category, idx) {
  const pool = NAME_POOL[category];
  return pool[idx % pool.length];
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function clearDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    fs.unlinkSync(path.join(dir, f));
  }
}

async function main() {
  ensureDir(UPLOADS);
  clearDir(UPLOADS);

  const entries = fs.readdirSync(SRC).filter((f) => /\.jpe?g$/i.test(f));
  const parsed = entries
    .map((f) => {
      const p = parseName(f);
      if (!p) return null;
      p.filename = f;
      p.category = categoryFor(p);
      return p;
    })
    .filter((x) => x && x.category);

  const groups = new Map();
  for (const p of parsed) {
    const k = `${p.category}::${p.key}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  }

  for (const arr of groups.values()) arr.sort((a, b) => a.variant - b.variant);

  const sortedKeys = [...groups.keys()].sort((a, b) => {
    const [ca, ka] = a.split("::");
    const [cb, kb] = b.split("::");
    if (ca !== cb) return ca.localeCompare(cb);
    return ka.localeCompare(kb);
  });

  const products = [];
  const perCategoryIdx = {};
  let id = 1;

  for (const k of sortedKeys) {
    const arr = groups.get(k);
    const category = arr[0].category;
    perCategoryIdx[category] = (perCategoryIdx[category] || 0);
    const idx = perCategoryIdx[category];

    const productNum = String(idx + 1).padStart(2, "0");
    const imagePaths = [];

    for (let i = 0; i < arr.length; i++) {
      const src = path.join(SRC, arr[i].filename);
      const newName = `${category}-${productNum}-${i + 1}.jpg`;
      const dst = path.join(UPLOADS, newName);
      fs.copyFileSync(src, dst);
      imagePaths.push(`/uploads/${newName}`);
    }

    products.push({
      id: id++,
      name: nameFor(category, idx),
      price: priceFor(category, idx),
      category,
      images: imagePaths,
      description: DESCRIPTIONS[category],
      colors: [],
      sizes: [],
      featured: idx < 4,
      newArrival: idx < 6,
    });

    perCategoryIdx[category]++;
  }

  ensureDir(path.dirname(PRODUCTS_JSON));
  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 2));

  const counts = products.reduce((a, p) => {
    a[p.category] = (a[p.category] || 0) + 1;
    return a;
  }, {});
  console.log("Imported", products.length, "products:");
  for (const [c, n] of Object.entries(counts)) console.log("  ", c, "→", n);
  console.log("Uploads:", fs.readdirSync(UPLOADS).length, "files");
}

main().catch((e) => { console.error(e); process.exit(1); });
