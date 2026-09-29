import { departments, sections } from "./sections";
import { products as curatedProducts } from "./products";
import {
  scenarios as curatedScenarios,
  terms as curatedTerms,
  trainerSteps as curatedTrainerSteps,
} from "./trainer";
import { catalogProducts } from "./catalog-seed";
import { liveCatalogProducts } from "./catalog-live";
import {
  buildAutoTrainer,
  ensureScenariosForSection,
  ensureTermsForSection,
} from "./auto-trainer";
import type { PriceBandId, Product, Section, Scenario, Term, TrainerStep } from "./types";

export { departments, sections };
export * from "./types";
export { catalogMeta } from "./catalog-seed";

function mergeProducts(): Product[] {
  const map = new Map<string, Product>();
  // seed educational catalog first
  for (const p of catalogProducts) map.set(p.id, p);
  // curated trainer hits override / enrich by id overlap on name keys — keep both
  for (const p of curatedProducts) map.set(p.id, p);
  // live parse overlays last (unique ids)
  for (const p of liveCatalogProducts) map.set(p.id, p);
  return Array.from(map.values());
}

export const products: Product[] = mergeProducts();

const termMap = new Map<string, Term>();
for (const t of curatedTerms) termMap.set(t.id, t);
for (const section of sections) {
  for (const t of ensureTermsForSection(
    section,
    curatedTerms.filter((x) => x.sectionId === section.id),
  )) {
    if (!termMap.has(t.id)) termMap.set(t.id, t);
  }
}
export const terms: Term[] = Array.from(termMap.values());

const scenarioMap = new Map<string, Scenario>();
for (const s of curatedScenarios) scenarioMap.set(s.id, s);
for (const section of sections) {
  const sectionProducts = products.filter((p) => p.sectionId === section.id);
  for (const s of ensureScenariosForSection(
    section,
    curatedScenarios.filter((x) => x.sectionId === section.id),
    sectionProducts,
  )) {
    if (!scenarioMap.has(s.id)) scenarioMap.set(s.id, s);
  }
}
export const scenarios: Scenario[] = Array.from(scenarioMap.values());

const trainerCache = new Map<string, TrainerStep[]>();
function trainerFor(sectionId: string): TrainerStep[] {
  if (trainerCache.has(sectionId)) return trainerCache.get(sectionId)!;
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return [];
  const hand = curatedTrainerSteps.filter((s) => s.sectionId === sectionId);
  const steps = buildAutoTrainer(
    section,
    hand,
    products.filter((p) => p.sectionId === sectionId),
    terms.filter((t) => t.sectionId === sectionId),
    scenarios.filter((s) => s.sectionId === sectionId),
  );
  trainerCache.set(sectionId, steps);
  return steps;
}

export const trainerSteps: TrainerStep[] = sections.flatMap((s) => trainerFor(s.id));

export function getDepartment(id: string) {
  return departments.find((d) => d.id === id);
}

export function getSection(id: string) {
  return sections.find((s) => s.id === id);
}

export function getSectionsByDepartment(departmentId: string) {
  return sections.filter((s) => s.departmentId === departmentId);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function getProductsBySection(sectionId: string) {
  return products.filter((p) => p.sectionId === sectionId);
}

export function getHitsBySection(sectionId: string) {
  return getProductsBySection(sectionId).filter((p) => p.isHit);
}

export function getProductsByBand(sectionId: string, bandId: PriceBandId) {
  return getProductsBySection(sectionId).filter((p) => p.bandId === bandId);
}

export function getTerm(id: string) {
  return terms.find((t) => t.id === id);
}

export function getTermsBySection(sectionId: string) {
  return terms.filter((t) => t.sectionId === sectionId);
}

export function getScenario(id: string) {
  return scenarios.find((s) => s.id === id);
}

export function getScenariosBySection(sectionId: string) {
  return scenarios.filter((s) => s.sectionId === sectionId);
}

export function getTrainerSteps(sectionId: string) {
  return trainerFor(sectionId);
}

export function getPrioritySections() {
  return sections.filter((s) => s.priority);
}

export function getAllBrands() {
  return Array.from(new Set(products.map((p) => p.brand))).sort((a, b) =>
    a.localeCompare(b, "uk"),
  );
}

export function getCatalogStats() {
  return {
    products: products.length,
    sections: sections.length,
    departments: departments.length,
    live: liveCatalogProducts.length,
    seed: catalogProducts.length,
    curated: curatedProducts.length,
  };
}

export function searchAll(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { sections: [] as Section[], products: [] as Product[], scenarios: [] as Scenario[] };
  }

  const matchedSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.id.includes(q),
  );

  const matchedProducts = products.filter((p) => {
    const hay = [
      p.name,
      p.brand,
      p.forWhom,
      p.pitch,
      ...p.tags,
      ...p.pros,
      ...Object.values(p.specs),
      p.price != null ? String(p.price) : "",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const matchedScenarios = scenarios.filter(
    (s) =>
      s.clientPhrase.toLowerCase().includes(q) ||
      s.coachTip.toLowerCase().includes(q) ||
      s.budgetHint.toLowerCase().includes(q),
  );

  return {
    sections: matchedSections,
    products: matchedProducts,
    scenarios: matchedScenarios,
  };
}

export function bandLabel(bandId: PriceBandId) {
  if (bandId === "budget") return "Бюджет";
  if (bandId === "mid") return "Середній";
  return "Преміум";
}

export function filterCatalog(opts: {
  sectionId?: string;
  bandId?: PriceBandId | "all";
  brand?: string;
  q?: string;
  hitsOnly?: boolean;
  maxPrice?: number;
  minPrice?: number;
}) {
  let list = products.slice();
  if (opts.sectionId) list = list.filter((p) => p.sectionId === opts.sectionId);
  if (opts.bandId && opts.bandId !== "all") list = list.filter((p) => p.bandId === opts.bandId);
  if (opts.brand) list = list.filter((p) => p.brand === opts.brand);
  if (opts.hitsOnly) list = list.filter((p) => p.isHit);
  if (opts.minPrice != null) list = list.filter((p) => (p.price ?? 0) >= opts.minPrice!);
  if (opts.maxPrice != null) list = list.filter((p) => (p.price ?? Infinity) <= opts.maxPrice!);
  if (opts.q?.trim()) {
    const q = opts.q.trim().toLowerCase();
    list = list.filter((p) =>
      [p.name, p.brand, p.forWhom, ...p.tags].join(" ").toLowerCase().includes(q),
    );
  }
  return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
}
