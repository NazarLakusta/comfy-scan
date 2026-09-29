#!/usr/bin/env node
/**
 * Local Comfy public-catalog parser (educational).
 * Run from YOUR PC/WSL (Cloudflare often blocks cloud IPs):
 *
 *   npm run parse:comfy
 *
 * Polite delays, category pages only. Writes data/catalog/live-products.json
 * and merges into src/content/catalog-live.ts for the app.
 *
 * Respect comfy.ua robots.txt: no /api/, no aggressive crawling.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "data", "catalog");
fs.mkdirSync(outDir, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ComfyFloorMap/1.0 (personal-education)";

/** Map Comfy category URL path → our section id */
const CATEGORIES = [
  { path: "/ua/smartfony/", sectionId: "smartphones" },
  { path: "/ua/noutbuki/", sectionId: "laptops" },
  { path: "/ua/televizory/", sectionId: "tvs" },
  { path: "/ua/holodilniki/", sectionId: "fridges" },
  { path: "/ua/stiralnye-mashiny/", sectionId: "washers" },
  { path: "/ua/kondicionery/", sectionId: "acs" },
  { path: "/ua/mikrovolnovye-pechi/", sectionId: "microwaves" },
  { path: "/ua/pylesosy/", sectionId: "vacuums" },
  { path: "/ua/feny/", sectionId: "hair-dryers" },
  { path: "/ua/vypryamiteli-dlya-volos/", sectionId: "stylers" },
  { path: "/ua/naushniki/", sectionId: "headphones" },
  { path: "/ua/planshety/", sectionId: "tablets" },
  { path: "/ua/monitory/", sectionId: "monitors" },
  { path: "/ua/posudomoechnye-mashiny/", sectionId: "dishwashers" },
  { path: "/ua/kofemashiny/", sectionId: "coffee" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function bandFromPrice(sectionId, price) {
  const table = {
    smartphones: [12000, 25000],
    laptops: [20000, 40000],
    tvs: [15000, 35000],
    washers: [15000, 28000],
    fridges: [16000, 32000],
    acs: [18000, 32000],
    microwaves: [3000, 7000],
    vacuums: [4000, 12000],
    "hair-dryers": [1500, 5000],
    stylers: [1500, 5000],
  };
  const [a, b] = table[sectionId] || [10000, 25000];
  if (price < a) return "budget";
  if (price < b) return "mid";
  return "premium";
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function extractProducts(html, sectionId) {
  const products = [];
  // JSON-LD Product blocks
  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRe.exec(html))) {
    try {
      const data = JSON.parse(m[1]);
      const list = Array.isArray(data) ? data : [data];
      for (const item of list) {
        const graph = item["@graph"] || [item];
        for (const node of graph) {
          if (!node || (node["@type"] !== "Product" && !(Array.isArray(node["@type"]) && node["@type"].includes("Product"))))
            continue;
          const name = node.name || "";
          const brand = typeof node.brand === "string" ? node.brand : node.brand?.name || name.split(" ")[0] || "Comfy";
          const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
          const price = Number(offers?.price || offers?.lowPrice || 0);
          const url = node.url || offers?.url || "";
          if (!name || !price) continue;
          products.push(makeProduct(sectionId, brand, name, price, url));
        }
      }
    } catch {
      /* ignore bad json-ld */
    }
  }

  // Fallback: price + title patterns commonly used in ecommerce cards
  if (products.length === 0) {
    const cardRe =
      /href="(https:\/\/comfy\.ua\/ua\/[^"]+)"[^>]*>[\s\S]{0,400}?([0-9][0-9\s]{2,9})\s*(?:₴|грн)/gi;
    let c;
    const seen = new Set();
    while ((c = cardRe.exec(html))) {
      const url = c[1];
      if (seen.has(url) || url.includes("search") || url.includes("compare")) continue;
      seen.add(url);
      const price = Number(String(c[2]).replace(/\s/g, ""));
      const slug = decodeURIComponent(url.split("/").filter(Boolean).pop() || "item");
      const name = decodeEntities(slug.replace(/-/g, " ")).slice(0, 80);
      if (!price || price < 100) continue;
      products.push(makeProduct(sectionId, name.split(" ")[0], name, price, url));
      if (products.length >= 40) break;
    }
  }

  return products;
}

function makeProduct(sectionId, brand, name, price, url) {
  const bandId = bandFromPrice(sectionId, price);
  const id = `live-${sectionId}-${Buffer.from(`${brand}-${name}-${price}`).toString("base64url").slice(0, 18)}`;
  return {
    id,
    sectionId,
    bandId,
    brand: String(brand).slice(0, 40),
    name: String(name).slice(0, 120),
    price,
    tags: ["live", bandId, sectionId],
    forWhom:
      bandId === "budget"
        ? "Бюджетний сегмент каталогу"
        : bandId === "mid"
          ? "Середній сегмент каталогу"
          : "Преміум сегмент каталогу",
    pros: [
      `Ціна орієнтовно ${price.toLocaleString("uk-UA")} ₴`,
      "З публічного каталогу Comfy",
      "Порівняй з хітами тренажера",
    ],
    con: "Уточнюй наявність і акції в Digital Assistant / на сайті в день зміни",
    upsell: ["Аксесуари", "Гарантія", "Кредит/ОП"],
    pitch: `${brand} ${name} — орієнтовно ${price.toLocaleString("uk-UA")} ₴. Перевір актуальність перед клієнтом.`,
    specs: { price: `${price} ₴`, source: "comfy.ua" },
    isHit: false,
    relatedIds: [],
    sourceUrl: url || undefined,
  };
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "uk-UA,uk;q=0.9,en;q=0.8",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

async function main() {
  console.log("Comfy Floor Map — local catalog parse");
  console.log("Polite mode: ~2.5s between categories\n");

  const all = [];
  const report = [];

  for (const cat of CATEGORIES) {
    const url = `https://comfy.ua${cat.path}`;
    process.stdout.write(`→ ${cat.sectionId} … `);
    try {
      const { ok, status, text } = await fetchText(url);
      if (!ok || text.includes("Just a moment") || text.includes("cf-browser-verification")) {
        console.log(`blocked/failed (${status})`);
        report.push({ sectionId: cat.sectionId, status, ok: false, count: 0 });
      } else {
        const items = extractProducts(text, cat.sectionId);
        all.push(...items);
        console.log(`${items.length} items`);
        report.push({ sectionId: cat.sectionId, status, ok: true, count: items.length });
      }
    } catch (e) {
      console.log(`error: ${e.message}`);
      report.push({ sectionId: cat.sectionId, ok: false, error: String(e.message), count: 0 });
    }
    await sleep(2500);
  }

  // de-dupe by name+price
  const seen = new Set();
  const unique = [];
  for (const p of all) {
    const k = `${p.sectionId}|${p.name}|${p.price}`;
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(p);
  }

  fs.writeFileSync(path.join(outDir, "live-products.json"), JSON.stringify(unique, null, 2));
  fs.writeFileSync(
    path.join(outDir, "live-report.json"),
    JSON.stringify({ at: new Date().toISOString(), total: unique.length, report }, null, 2),
  );

  const ts = `/* auto-generated by scripts/parse-comfy.mjs */
import type { CatalogProduct } from "./catalog-seed";

export const liveCatalogProducts: CatalogProduct[] = ${JSON.stringify(unique, null, 2)} as CatalogProduct[];
`;
  fs.writeFileSync(path.join(root, "src", "content", "catalog-live.ts"), ts);

  console.log(`\nDone: ${unique.length} products`);
  console.log("Wrote data/catalog/live-products.json + src/content/catalog-live.ts");
  if (unique.length === 0) {
    console.log("\nNo products parsed (Cloudflare/HTML changed).");
    console.log("App still works on educational seed catalog (npm run seed:catalog).");
  }
}

main();
