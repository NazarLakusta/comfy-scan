# Comfy.ua public catalog research (educational)

**Date:** 2026-09-29  
**Scope:** Research only — how to obtain public product name, price, category, key specs, URL for an educational personal-trainer app. No full parser built.  
**Method:** Direct HTTP probes from this environment + Wayback Machine snapshots of SSR HTML + inspection of storefront JS (`im-product/js/app.*.js`).

---

## Executive summary

| Approach | Works from this env? | Fields available | Notes |
|---|---|---|---|
| **HTML SSR: `window.__INITIAL_STATE__` + JSON-LD** | Blocked live by Cloudflare; works via Wayback / browser session | name, price, category, specs, URL | **Best public technical approach** once pages are reachable |
| **`im.comfy.ua` categories/cities/cms APIs** | Yes (no Cloudflare on most routes) | category tree, IDs, URL keys | Great for category map; not product payloads |
| **`im.comfy.ua/api/products/*`** | Routes exist but return Cloudflare 403 / nginx 503 | would be ideal | Not usable anonymously from datacenter IPs |
| **`api.comfy.ua` (ASP.NET Help)** | Reachable but **401 auth required** | internal PIM/TMS/loyalty | Not a public catalog API |
| **Sitemap** | Declared in robots.txt; live fetch CF-blocked; archived XML works | product/category URLs | Good URL discovery when accessible |
| **GraphQL / `__NEXT_DATA__`** | No Next.js; no public catalog GraphQL | — | Softcube GraphQL is recommendations only |

**Best legal/public approach:** Prefer an official catalog/affiliate feed or written permission from Comfy. For educational demos without a partnership, use **public product HTML** (JSON-LD + `__INITIAL_STATE__`) and the **public categories API**, while respecting `robots.txt`, rate limits, and Cloudflare terms. Do not treat undocumented private microservices as an open API.

---

## 1. Best legal / public approach

### Recommended stack (educational)

1. **Ask Comfy** for a partner/affiliate/CSV/XML product feed (most compliant for ongoing use).
2. Until then, for demos:
   - Discover URLs via **sitemap** (`robots.txt` → `https://comfy.ua/media/im/sitemap/sitemap.xml`) when not challenge-blocked.
   - Resolve sections via public **`GET https://im.comfy.ua/api/categories/...`** (verified working).
   - Fetch product pages (browser or archive) and parse:
     - `script[type="application/ld+json"]` (`@type=Product`)
     - `window.__INITIAL_STATE__.product` + `.prices`
   - Cache aggressively; refresh slowly.

### Legal / ToS notes observed

- `https://comfy.ua/robots.txt` is publicly readable.
- **`Disallow: /api/`** on `comfy.ua` — automated hits to main-site `/api/*` conflict with robots guidance.
- Bingbot gets `Crawl-delay: 2`.
- Search, captcha, checkout, account, compare, reviews paths are disallowed.
- Live HTML is behind **Cloudflare managed challenge** from this datacenter; commercial scrapers advertise Comfy extraction, but that is not a license.
- `api.comfy.ua` returns `Токен аторизации пуст, доступ запрещен` (401) — internal Dynamics AX services, not for public catalog use.
- `im.comfy.ua` has no `robots.txt` (404). Still treat it as undocumented; prefer partnership for production.

---

## 2. Working endpoints & HTML selectors

### 2.1 Confirmed working (live, this session)

```
# Category tree (UA storeId=5) — ~tree with children
GET https://im.comfy.ua/api/categories/list/5
Accept: application/json
Origin: https://comfy.ua
Referer: https://comfy.ua/ua/

# Flat list (~4028 categories)
GET https://im.comfy.ua/api/categories/list/flat/5

# Resolve slug → category id/name/path
GET https://im.comfy.ua/api/categories/url-key/smartfon?storeId=5
→ {"id":"67","name":"Смартфони","requestPath":"smartfon/", ...}

GET https://im.comfy.ua/api/categories/url-key/notebook?storeId=5
GET https://im.comfy.ua/api/categories/url-key/flat-tvs?storeId=5
GET https://im.comfy.ua/api/categories/url-key/wash-machines?storeId=5
GET https://im.comfy.ua/api/categories/url-key/refrigerator?storeId=5
GET https://im.comfy.ua/api/categories/url-key/conditioners?storeId=5
GET https://im.comfy.ua/api/categories/url-key/hair-dryer?storeId=5

# Cities
GET https://im.comfy.ua/api/cities/list/5

# CMS contact settings
GET https://im.comfy.ua/api/cms/settings/global?storeId=5

# Product labels (credits/promos) — works for known SKU
GET https://im.comfy.ua/api/labels/list?sku=3197301&storeId=5&cityId=506&useFor=pdp&page=product
```

**Store / city defaults from SSR:** `storeId=5` (UA), `cityId=506` (Київ).

### 2.2 Product API routes (from storefront JS — currently blocked)

Discovered in archived `https://comfy.ua/im-product/js/app.*.js` against `SERVICE_PRODUCTS_URL=https://im.comfy.ua/api/products`:

```
GET  /api/products/single/{sku}?storeId=5&cityId=506&process=pdp
GET  /api/products/single/path/{urlPath}?storeId=5&cityId=506
GET  /api/products/single/{sku}/dimensions?storeId=5
GET  /api/products/single/{sku}/description?storeId=5
POST /api/products/list?storeId=5&cityId=506
     body: {"skus":["3197301"],"include":[]}
GET  /api/products/category/{categoryId}/list?cityId=506&storeId=5&size=20&page=1&sortBy=popular&order=desc
GET  /api/products/category/{categoryId}/filter?cityId=...&storeId=...&filter=&size=&page=
```

**Live result from this env:** Cloudflare “Attention Required” **403** on `/api/products/single/...` and `/list`; bare `/api/products?...` → nginx **503**. Not usable here without a cleared browser/session.

### 2.3 Sitemap

```
robots.txt → Sitemap: https://comfy.ua/media/im/sitemap/sitemap.xml
```

Index format (Wayback `20260201151151`):

```xml
<sitemapindex>
  <sitemap><loc>https://comfy.ua/media/im/sitemap/sitemap-1.xml</loc></sitemap>
  ...
  <sitemap><loc>https://comfy.ua/media/im/sitemap/sitemap-11.xml</loc></sitemap>
</sitemapindex>
```

Live fetch: Cloudflare challenge. Use browser session or Wayback `id_` snapshots for research.

### 2.4 Product HTML selectors / embedded JSON (verified on archived PDP)

**Primary (preferred):**

| Target | Selector / expression |
|---|---|
| Full catalog state | `script` containing `window.__INITIAL_STATE__=` → JSON |
| Product core | `__INITIAL_STATE__.product.product` |
| Price | `__INITIAL_STATE__.prices.price` (`price`, `specialPrice`, `bonus`) |
| Key specs | `.product.topAttributes[]` (`label`, `value`) |
| Full specs | `.product.attributeGroups[].attributes[]` |
| JSON-LD Product | `script[type="application/ld+json"]` where `@type=="Product"` |
| Breadcrumbs | JSON-LD `@type=="BreadcrumbList"` |
| Analytics mirror | `window.ucpUserDetails` / `dataLayer` `view_item` |

**DOM fallbacks (SSR):**

| Field | Selector |
|---|---|
| Title | `h1.product-title` |
| Price block | `.price__current`, `.price__currency`, `.product-price-block` |
| SSI price blob | `[data-ssi-info]` (HTML-encoded JSON with `price.sku`, `price.price`) |
| Schema props | `[itemprop="name"]`, `[itemprop="additionalProperty"]` |

**URL patterns:**

- Category: `https://comfy.ua/ua/{urlKey}/` (often trailing slash)
- Product: `https://comfy.ua/ua/{urlKey}.html`
- Filters: `https://comfy.ua/ua/smartfon/brand__apple__seriya_smartphone__apple-iphone-16/`
- Images CDN (live OK): `https://cdn.comfy.ua/media/catalog/product/...`

**Not present:** `__NEXT_DATA__` (not Next.js). Theme is Magento Enterprise skin `comfy_3` + Vue/Quasar product app under `/im-product/`.

### 2.5 Internal host (do not use for public catalog)

`https://api.comfy.ua/Help` — Invent/TMS/Payment/Loyalty. Example `POST /api/getSubcategoryInfo` requires auth token.

---

## 3. Suggested category URL map (major sections)

User-requested colloquial slugs → **actual Comfy UA paths** (live `url-key` API, storeId=5):

| Colloquial | Correct path | Category id | Name |
|---|---|---|---|
| smartfony | https://comfy.ua/ua/smartfon/ | 67 | Смартфони |
| noutbuki | https://comfy.ua/ua/notebook/ | 120 | Ноутбуки всі |
| televizory | https://comfy.ua/ua/flat-tvs/ | 78 | Телевізори |
| pralni-mashyny | https://comfy.ua/ua/wash-machines/ | 46 | Пральні машини |
| holodylnyky | https://comfy.ua/ua/refrigerator/ | 95 | Холодильники |
| konditsionery | https://comfy.ua/ua/conditioners/ | 7173 | Кондиціонери |
| feny | https://comfy.ua/ua/hair-dryer/ | 135 | Фени |

Additional high-traffic sections from storefront nav / flat list:

| Path | id | Name |
|---|---|---|
| https://comfy.ua/ua/monitor/ | 114 | Монітори |
| https://comfy.ua/ua/plane-table-computer/ | 66 | Планшети всі |
| https://comfy.ua/ua/nayshniki/ | 459 | Навушники |
| https://comfy.ua/ua/smart-watches/ | 973 | Смарт-годинники |
| https://comfy.ua/ua/vacuum-cleaner/ | 140 | Пилососи |
| https://comfy.ua/ua/coffi-mash/ | 489 | Кавомашини |
| https://comfy.ua/ua/iron/ | 143 | Праски |
| https://comfy.ua/ua/blender/ | 152 | Блендери |
| https://comfy.ua/ua/gadzhety/ | 960 | Смарт-годинники та гаджети |
| https://comfy.ua/ua/3d-printers/ | 1002 | 3D-принтери |
| https://comfy.ua/ua/telephone-smartfon/ | 265 | Смартфони та телефони (parent) |

Parent for TVs: `https://comfy.ua/ua/tv-video/` (id 37).

---

## 4. Rate-limit friendly strategy

1. **Prefer batch category metadata** once: `categories/list/flat/5` (~1.8MB) — cache 24h+.
2. **URL discovery:** sitemap shards (`sitemap-1.xml` …) overnight, not per user request.
3. **Product fetch cadence:** ≤ 1 request / 2–3s (align with Bing `Crawl-delay: 2`); single worker; jitter 2–5s.
4. **Batch SKUs** only if products API becomes available via permitted channel (`POST /list` with ~20–50 SKUs), not parallel storms.
5. **Cache TTL:** prices 1–6h; specs/name/URL 24–72h; categories 24h.
6. **Identify politely:** educational User-Agent + contact; do not ignore robots `Disallow: /api/` on `comfy.ua`.
7. **Avoid:** search URLs, review endpoints, account/checkout (disallowed); Cloudflare challenge bypass farms.
8. **Educational demos:** seed from a small fixed SKU list or Wayback snapshots rather than continuous live crawling.
9. **Backoff:** on 403/429/503, exponential backoff (1m → 15m); stop on captcha pages.
10. **City:** pin `cityId=506` unless locality matters — fewer cache variants.

---

## 5. Sample product payloads successfully fetched

Fetched via Wayback raw snapshots of live SSR HTML (not live `comfy.ua` HTML from this IP). Parsed from `window.__INITIAL_STATE__` + JSON-LD.

### Sample 1 — 3-D принтер Anycubic Kobra 2 Neo (KNVA0BK-Y-O)
- Archive source tag: `archive-20251211`
- Live URL: https://comfy.ua/ua/3-d-printer-anycubic-kobra-2-neo-knva0bk-y-o.html

```json
{
  "source": "archive-20251211",
  "name": "3-D принтер Anycubic Kobra 2 Neo (KNVA0BK-Y-O)",
  "sku": "3197301",
  "id": 9952917,
  "brand": "Anycubic",
  "category": "3D-принтери",
  "category_path": "3d-printers/",
  "url": "https://comfy.ua/ua/3-d-printer-anycubic-kobra-2-neo-knva0bk-y-o.html",
  "price_uah": 11499,
  "list_price_uah": 11499,
  "currency": "UAH",
  "in_stock": false,
  "key_specs": [
    {
      "label": "Технологія друку",
      "value": "FDM"
    },
    {
      "label": "Матеріал нитки",
      "value": "PETG, PLA, ABS, TPU"
    },
    {
      "label": "Максимальна швидкість друку",
      "value": "250 мм/сек"
    },
    {
      "label": "Кількість сопел",
      "value": "1 шт."
    },
    {
      "label": "Область друку",
      "value": "250x220x220"
    }
  ],
  "json_ld": {
    "name": "3-D принтер Anycubic Kobra 2 Neo (KNVA0BK-Y-O)",
    "sku": "3197301",
    "price": 11499,
    "availability": "https://schema.org/OutOfStock"
  }
}
```

### Sample 2 — 3-D принтер Anycubic Kobra 2 Plus (K2PB0BK-Y-O)
- Archive source tag: `archive-20251205`
- Live URL: https://comfy.ua/ua/3-d-printer-anycubic-kobra-2-plus-k2pb0bk-y-o.html

```json
{
  "source": "archive-20251205",
  "name": "3-D принтер Anycubic Kobra 2 Plus (K2PB0BK-Y-O)",
  "sku": "3197297",
  "id": 9952913,
  "brand": "Anycubic",
  "category": "3D-принтери",
  "category_path": "3d-printers/",
  "url": "https://comfy.ua/ua/3-d-printer-anycubic-kobra-2-plus-k2pb0bk-y-o.html",
  "price_uah": 13999,
  "list_price_uah": 15999,
  "currency": "UAH",
  "in_stock": true,
  "key_specs": [
    {
      "label": "Технологія друку",
      "value": "FDM"
    },
    {
      "label": "Матеріал нитки",
      "value": "PETG, PLA, ABS, TPU"
    },
    {
      "label": "Максимальна швидкість друку",
      "value": "500 мм/сек"
    },
    {
      "label": "Кількість сопел",
      "value": "1 шт."
    },
    {
      "label": "Область друку",
      "value": "400x320x320"
    }
  ],
  "json_ld": {
    "name": "3-D принтер Anycubic Kobra 2 Plus (K2PB0BK-Y-O)",
    "sku": "3197297",
    "price": 13999,
    "availability": "https://schema.org/InStock"
  }
}
```

### Sample 3 — 3-D принтер Anycubic Kobra 3 Combo EU (K3CBBK0A-O)
- Archive source tag: `archive-20251202`
- Live URL: https://comfy.ua/ua/3-d-printer-anycubic-kobra-3-combo-eu-k3cbbk0a-o.html

```json
{
  "source": "archive-20251202",
  "name": "3-D принтер Anycubic Kobra 3 Combo EU (K3CBBK0A-O)",
  "sku": "3197299",
  "id": 9952914,
  "brand": "Anycubic",
  "category": "3D-принтери",
  "category_path": "3d-printers/",
  "url": "https://comfy.ua/ua/3-d-printer-anycubic-kobra-3-combo-eu-k3cbbk0a-o.html",
  "price_uah": 23799,
  "list_price_uah": 23799,
  "currency": "UAH",
  "in_stock": true,
  "key_specs": [
    {
      "label": "Технологія друку",
      "value": "FDM"
    },
    {
      "label": "Матеріал нитки",
      "value": "ASA, HIPS, PA, PETG, PLA, PET, ABS, TPU"
    },
    {
      "label": "Максимальна швидкість друку",
      "value": "600 мм/сек"
    },
    {
      "label": "Кількість сопел",
      "value": "1 шт."
    },
    {
      "label": "Область друку",
      "value": "250x250x260"
    }
  ],
  "json_ld": {
    "name": "3-D принтер Anycubic Kobra 3 Combo EU (K3CBBK0A-O)",
    "sku": "3197299",
    "price": 23799,
    "availability": "https://schema.org/OutOfStock"
  }
}
```

### Sample 4 — 3-D принтер Anycubic Kobra 3 (KB30BK0A-O)
- Archive source tag: `archive-20260404`
- Live URL: https://comfy.ua/ua/3-d-printer-anycubic-kobra-3-kb30bk0a-o.html

```json
{
  "source": "archive-20260404",
  "name": "3-D принтер Anycubic Kobra 3 (KB30BK0A-O)",
  "sku": "3197300",
  "id": 9952916,
  "brand": "Anycubic",
  "category": "3D-принтери",
  "category_path": "3d-printers/",
  "url": "https://comfy.ua/ua/3-d-printer-anycubic-kobra-3-kb30bk0a-o.html",
  "price_uah": 17999,
  "list_price_uah": 17999,
  "currency": "UAH",
  "in_stock": true,
  "key_specs": [
    {
      "label": "Технологія друку",
      "value": "FDM"
    },
    {
      "label": "Матеріал нитки",
      "value": "ASA, HIPS, PA, PETG, PLA, PET, ABS, TPU"
    },
    {
      "label": "Максимальна швидкість друку",
      "value": "600 мм/сек"
    },
    {
      "label": "Кількість сопел",
      "value": "1 шт."
    },
    {
      "label": "Область друку",
      "value": "250x250x260"
    }
  ],
  "json_ld": {
    "name": "3-D принтер Anycubic Kobra 3 (KB30BK0A-O)",
    "sku": "3197300",
    "price": 17999,
    "availability": "https://schema.org/InStock"
  }
}
```

### Sample 5 — 3-D принтер Anycubic Photon M5
- Archive source tag: `archive-20260404-photon`
- Live URL: https://comfy.ua/ua/3-d-printer-anycubic-photon-m5.html

```json
{
  "source": "archive-20260404-photon",
  "name": "3-D принтер Anycubic Photon M5",
  "sku": "3228626",
  "id": 9960362,
  "brand": "Anycubic",
  "category": "3D-принтери",
  "category_path": "3d-printers/",
  "url": "https://comfy.ua/ua/3-d-printer-anycubic-photon-m5.html",
  "price_uah": 23945,
  "list_price_uah": 23945,
  "currency": "UAH",
  "in_stock": false,
  "key_specs": [
    {
      "label": "Технологія друку",
      "value": "LCD"
    },
    {
      "label": "Матеріал нитки",
      "value": "Фотополімер"
    },
    {
      "label": "Максимальна швидкість друку",
      "value": "50 мм/год"
    },
    {
      "label": "Область друку",
      "value": "200 x 218 x123 мм"
    }
  ],
  "json_ld": {
    "name": "3-D принтер Anycubic Photon M5",
    "sku": "3228626",
    "price": 23945,
    "availability": "https://schema.org/OutOfStock"
  }
}
```

---

## Probe log (high level)

| Target | Result |
|---|---|
| `GET https://comfy.ua/robots.txt` | 200 — sitemap + Disallow `/api/` |
| `GET https://comfy.ua/ua/`, category pages | 403 Cloudflare challenge |
| `GET https://comfy.ua/media/im/sitemap/sitemap.xml` | 403 Cloudflare |
| `GET https://api.comfy.ua/Help` | 200 internal API docs |
| `POST https://api.comfy.ua/api/getSubcategoryInfo` | 401 auth required |
| `GET https://im.comfy.ua/api/categories/list/5` | **200 JSON** |
| `GET https://im.comfy.ua/api/categories/url-key/*` | **200 JSON** |
| `GET https://im.comfy.ua/api/products/single/*` | 403 Cloudflare |
| `GET https://cdn.comfy.ua/media/catalog/product/...jpg` | **200** image |
| Wayback PDP HTML | **200** with `__INITIAL_STATE__` + JSON-LD |
| `__NEXT_DATA__` / Magento GraphQL catalog | Not found |
| Softcube `ai.softcube.com/graphql` | Up (`__typename`), recommendations only |

---

## Practical recommendation for the trainer app

1. Ship a **static seed catalog** (3–20 SKUs) parsed from SSR/`__INITIAL_STATE__` for demos.
2. Use **`im.comfy.ua` categories API** for section navigation labels/IDs.
3. For “live” refresh in a classroom browser environment (not serverless DC), parse product HTML JSON-LD / `__INITIAL_STATE__` with 2–3s delay.
4. Pursue **official feed** before any production-scale ingestion.
5. Do **not** build a parser that hammers `/api/products` or bypasses Cloudflare — those services are gated and `/api/` is disallowed on the main host.

---

## Artifacts from this research session

- `/tmp/comfy-samples.json` — 5 parsed product payloads
- `/tmp/comfy-category-map.json` — resolved category paths (noisy; prefer table in §3)
- `/tmp/comfy-product.html` (+ `/tmp/p2.html`…`p5.html`) — archived PDP HTML
- `/tmp/app.js` — archived storefront bundle with API route strings
