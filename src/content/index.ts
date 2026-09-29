import { departments, sections } from "./sections";
import { products } from "./products";
import { scenarios, terms, trainerSteps } from "./trainer";
import type { PriceBandId, Product, Section } from "./types";

export { departments, sections, products, scenarios, terms, trainerSteps };
export * from "./types";

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
  return trainerSteps.filter((s) => s.sectionId === sectionId);
}

export function getPrioritySections() {
  return sections.filter((s) => s.priority);
}

export function searchAll(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { sections: [] as Section[], products: [] as Product[], scenarios: [] as typeof scenarios };
  }

  const matchedSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.id.includes(q),
  );

  const matchedProducts = products.filter((p) => {
    const hay = [p.name, p.brand, p.forWhom, p.pitch, ...p.tags, ...p.pros]
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
