#!/usr/bin/env node
/**
 * Local Comfy public-catalog parser (educational).
 * Run from YOUR PC/WSL (Cloudflare often blocks datacenter IPs):
 *
 *   npm run parse:comfy
 *
 * Strategy (from research):
 * 1) Resolve real category URL keys via https://im.comfy.ua/api/categories/...
 * 2) Fetch public category HTML on comfy.ua (polite delay)
 * 3) Parse JSON-LD + window.__INITIAL_STATE__ when present
 *
 * Respect robots.txt: do not hit comfy.ua/api/. Product microservices on
 * im.comfy.ua are often Cloudflare-gated — HTML fallback is primary.
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

/** Real Comfy urlKey → our section id (verified via im.comfy.ua categories API) */
const CATEGORIES = [
  { urlKey: "smartfon", sectionId: "smartphones" },
  { urlKey: "notebook", sectionId: "laptops" },
  { urlKey: "flat-tvs", sectionId: "tvs" },
  { urlKey: "refrigerator", sectionId: "fridges" },
  { urlKey: "wash-machines", sectionId: "washers" },
  { urlKey: "conditioners", sectionId: "acs" },
  { urlKey: "microwave-ovens", sectionId: "microwaves" },
  { urlKey: "vacuum-cleaners", sectionId: "vacuums" },
  { urlKey: "hair-dryer", sectionId: "hair-dryers" },
  { urlKey: "hair-straighteners", sectionId: "stylers" },
  { urlKey: "headphones", sectionId: "headphones" },
  { urlKey: "planchet", sectionId: "tablets" },
  { urlKey: "monitors", sectionId: "monitors" },
  { urlKey: "dish-washing-machines", sectionId: "dishwashers" },
  { urlKey: "coffee-machines", sectionId: "coffee" },
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

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      Origin: "https://comfy.ua",
      Referer: "https://comfy.ua/ua/",
    },
  });
  const text = await res.text();
  if (!res.ok || text.includes("Just a moment") || text.includes("Attention Required")) {
    return { ok: false, status: res.status, data: null, text };
  }
  try {
    return { ok: true, status: res.status, data: JSON.parse(text), text };
  } catch {
    return { ok: false, status: res.status, data: null, text };
  }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "uk-UA,uk;q=0.9,en;q=0.8",
      Accept: "text/html,application/xhtml+xml",
      Referer: "https://comfy.ua/ua/",
    },
    redirect: "follow",
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

async function resolveCategory(urlKey) {
  const url = `https://im.comfy.ua/api/categories/url-key/${encodeURIComponent(urlKey)}?storeId=5`;
  const { ok, status, data } = await fetchJson(url);
  if (!ok || !data?.requestPath) return { ok: false, status, meta: null };
  return {
    ok: true,
    status,
    meta: {
      id: data.id,
      name: data.name,
      urlKey: data.urlKey || urlKey,
      requestPath: String(data.requestPath).replace(/^\/+|\/+$/g, ""),
    },
  };
}

function extractFromInitialState(html, sectionId) {
  const products = [];
  const m = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/);
  if (!m) return products;
  try {
    const state = JSON.parse(m[1]);
    const lists = [];
    if (Array.isArray(state?.products)) lists.push(state.products);
    if (Array.isArray(state?.category?.products)) lists.push(state.category.products);
    if (Array.isArray(state?.listing?.products)) lists.push(state.listing.products);
    // common nested shapes
    const crawl = (node, depth = 0) => {
      if (!node || depth > 6) return;
      if (Array.isArray(node)) {
        for (const item of node) crawl(item, depth + 1);
        return;
      }
      if (typeof node !== "object") return;
      if (node.name && (node.price || node.prices || node.finalPrice)) {
        lists.push([node]);
      }
      for (const v of Object.values(node)) crawl(v, depth + 1);
    };
    crawl(state);

    const seen = new Set();
    for (const list of lists) {
      for (const item of list) {
        if (!item?.name) continue;
        const price = Number(
          item.price ??
            item.finalPrice ??
            item.prices?.price ??
            item.prices?.special ??
            item.prices?.current ??
            0,
        );
        if (!price) continue;
        const brand = item.brand?.name || item.brand || String(item.name).split(" ")[0];
        const urlPath = item.url || item.request_path || item.requestPath || "";
        const url = urlPath.startsWith("http")
          ? urlPath
          : urlPath
            ? `https://comfy.ua/ua/${String(urlPath).replace(/^\/+/, "")}`
            : "";
        const key = `${item.name}|${price}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const specs = {};
        const attrs = item.topAttributes || item.attributes || [];
        if (Array.isArray(attrs)) {
          for (const a of attrs.slice(0, 8)) {
            const label = a.name || a.label || a.code;
            const val = a.value || a.text;
            if (label && val) specs[String(label)] = String(val);
          }
        }
        products.push(makeProduct(sectionId, brand, item.name, price, url, specs));
        if (products.length >= 60) return products;
      }
    }
  } catch {
    /* ignore */
  }
  return products;
}

function extractProducts(html, sectionId) {
  const products = [];
  const fromState = extractFromInitialState(html, sectionId);
  products.push(...fromState);

  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRe.exec(html))) {
    try {
      const data = JSON.parse(m[1]);
      const list = Array.isArray(data) ? data : [data];
      for (const item of list) {
        const graph = item["@graph"] || [item];
        for (const node of graph) {
          if (
            !node ||
            (node["@type"] !== "Product" &&
              !(Array.isArray(node["@type"]) && node["@type"].includes("Product")))
          )
            continue;
          const name = node.name || "";
          const brand =
            typeof node.brand === "string"
              ? node.brand
              : node.brand?.name || name.split(" ")[0] || "Comfy";
          const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
          const price = Number(offers?.price || offers?.lowPrice || 0);
          const url = node.url || offers?.url || "";
          if (!name || !price) continue;
          products.push(makeProduct(sectionId, brand, name, price, url));
        }
      }
    } catch {
      /* ignore */
    }
  }

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

function makeProduct(sectionId, brand, name, price, url, extraSpecs = {}) {
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
    specs: { price: `${price} ₴`, source: "comfy.ua", ...extraSpecs },
    isHit: false,
    relatedIds: [],
    sourceUrl: url || undefined,
  };
}

async function main() {
  console.log("Comfy Floor Map — local catalog parse");
  console.log("1) resolve categories via im.comfy.ua");
  console.log("2) fetch HTML pages politely (~2.5s)\n");

  const categoryMeta = [];
  for (const cat of CATEGORIES) {
    process.stdout.write(`meta ${cat.urlKey} … `);
    const resolved = await resolveCategory(cat.urlKey);
    if (resolved.ok) {
      console.log(`${resolved.meta.name} → /ua/${resolved.meta.requestPath}/`);
      categoryMeta.push({ ...cat, ...resolved.meta });
    } else {
      console.log(`fallback path (${resolved.status})`);
      categoryMeta.push({
        ...cat,
        id: null,
        name: cat.urlKey,
        requestPath: cat.urlKey,
      });
    }
    await sleep(400);
  }

  fs.writeFileSync(
    path.join(outDir, "categories.json"),
    JSON.stringify({ at: new Date().toISOString(), categories: categoryMeta }, null, 2),
  );

  const all = [];
  const report = [];

  for (const cat of categoryMeta) {
    const url = `https://comfy.ua/ua/${cat.requestPath}/`;
    process.stdout.write(`→ ${cat.sectionId} … `);
    try {
      const { ok, status, text } = await fetchText(url);
      if (!ok || text.includes("Just a moment") || text.includes("cf-browser-verification") || text.includes("Attention Required")) {
        console.log(`blocked/failed (${status})`);
        report.push({ sectionId: cat.sectionId, url, status, ok: false, count: 0 });
      } else {
        const items = extractProducts(text, cat.sectionId);
        all.push(...items);
        console.log(`${items.length} items`);
        report.push({ sectionId: cat.sectionId, url, status, ok: true, count: items.length });
      }
    } catch (e) {
      console.log(`error: ${e.message}`);
      report.push({ sectionId: cat.sectionId, ok: false, error: String(e.message), count: 0 });
    }
    await sleep(2500);
  }

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
  console.log("Wrote data/catalog/{categories,live-products,live-report}.json + catalog-live.ts");
  if (unique.length === 0) {
    console.log("\nNo products parsed (Cloudflare/HTML). Seed catalog still works.");
    console.log("Tip: run this from home WSL after opening comfy.ua once in a browser.");
  }
}

main();
