import type { Product, Section, TrainerStep, Term, Scenario } from "./types";

/** Auto-build a full trainer path when handcrafted steps are missing. */
export function buildAutoTrainer(
  section: Section,
  handcrafted: TrainerStep[],
  products: Product[],
  terms: Term[],
  scenarios: Scenario[],
): TrainerStep[] {
  if (handcrafted.length > 0) return handcrafted;

  const hits = products.filter((p) => p.isHit).slice(0, 6);
  const steps: TrainerStep[] = [];

  steps.push({
    id: `auto-${section.id}-intro`,
    sectionId: section.id,
    type: "intro",
    title: `${section.title}: карта секції`,
    body: section.summary,
  });

  for (const t of terms.slice(0, 3)) {
    steps.push({
      id: `auto-${section.id}-term-${t.id}`,
      sectionId: section.id,
      type: "term",
      title: "Термін",
      body: "Запам’ятай простими словами — так і кажи клієнту.",
      termId: t.id,
    });
  }

  steps.push({
    id: `auto-${section.id}-band`,
    sectionId: section.id,
    type: "band",
    title: "Три полиці",
    body: section.priceBands.map((b) => `${b.label}: ${b.forWhom}`).join(" · "),
  });

  for (const p of hits.slice(0, 3)) {
    steps.push({
      id: `auto-${section.id}-p-${p.id}`,
      sectionId: section.id,
      type: "product",
      title: "Хіт секції",
      body: "Прочитай «мову продавця» вголос.",
      productId: p.id,
    });
  }

  if (hits.length >= 2) {
    steps.push({
      id: `auto-${section.id}-cmp`,
      sectionId: section.id,
      type: "compare",
      title: "Порівняй",
      body: "Знайди різницю однією фразою.",
      compareIds: hits.slice(0, 2).map((p) => p.id),
    });
  }

  for (const s of scenarios.slice(0, 2)) {
    steps.push({
      id: `auto-${section.id}-sc-${s.id}`,
      sectionId: section.id,
      type: "scenario",
      title: "Клиент сказав",
      body: "Відпрацюй відповідь.",
      scenarioId: s.id,
    });
  }

  steps.push({
    id: `auto-${section.id}-q1`,
    sectionId: section.id,
    type: "quiz",
    title: "Квіз",
    body: "Що питати першим?",
    quiz: {
      question: `Клієнт у секції «${section.title}». З чого почати?`,
      options: [
        { id: "a", label: "Одразу найдорожчу модель" },
        { id: "b", label: "Сценарій використання і бюджет → 2–3 варіанти", correct: true },
        { id: "c", label: "Усі характеристики підряд" },
      ],
      explain: "Сценарій і бюджет звужують полицю. Потім показуєш 2–3 хіти.",
    },
  });

  const hasBudget = products.some((p) => p.bandId === "budget");
  const hasMid = products.some((p) => p.bandId === "mid");
  if (hasBudget && hasMid) {
    steps.push({
      id: `auto-${section.id}-q2`,
      sectionId: section.id,
      type: "quiz",
      title: "Квіз",
      body: "Полиці",
      quiz: {
        question: "Коли логічніше середня полиця, а не бюджет?",
        options: [
          { id: "a", label: "Завжди, бо дорожче = краще" },
          {
            id: "b",
            label: "Коли клієнт користуватиметься часто і важливі тиша/ресурс/ключ-фіча",
            correct: true,
          },
          { id: "c", label: "Тільки якщо просить OLED/флагман" },
        ],
        explain: "Середній сегмент — про щоденний комфорт, не про статус.",
      },
    });
  }

  steps.push({
    id: `auto-${section.id}-sum`,
    sectionId: section.id,
    type: "summary",
    title: "Секцію пройдено",
    body: `Ти закрив «${section.title}»: полиці → хіти → порівняння → сценарій. Повтори слабкі картки завтра.`,
  });

  return steps;
}

export function ensureTermsForSection(section: Section, existing: Term[]): Term[] {
  if (existing.length > 0) return existing;
  return section.compareKeys.slice(0, 5).map((k) => ({
    id: `auto-term-${section.id}-${k.key}`,
    sectionId: section.id,
    title: k.label,
    plainExplain: `Ключ порівняння «${k.label}» у секції ${section.title}. Питай, чи це важливо клієнту, і пояснюй різницю між полицями саме цим параметром.`,
  }));
}

export function ensureScenariosForSection(
  section: Section,
  existing: Scenario[],
  products: Product[],
): Scenario[] {
  if (existing.length > 0) return existing;
  const budget = products.filter((p) => p.bandId === "budget").slice(0, 2);
  const mid = products.filter((p) => p.bandId === "mid").slice(0, 2);
  const premium = products.filter((p) => p.bandId === "premium").slice(0, 2);
  const out: Scenario[] = [];
  if (budget.length) {
    out.push({
      id: `auto-sc-${section.id}-budget`,
      sectionId: section.id,
      clientPhrase: `Щось з «${section.title}» недорого, на старт`,
      budgetHint: "Бюджетна полиця",
      recommendedProductIds: budget.map((p) => p.id),
      coachTip:
        "Не соромся бюджету — закрий задачу і запропонуй 1 крок вище, якщо користування щоденне.",
    });
  }
  if (mid.length) {
    out.push({
      id: `auto-sc-${section.id}-mid`,
      sectionId: section.id,
      clientPhrase: `Беру «${section.title}» на щодень, хочу щоб не бісило`,
      budgetHint: "Середня полиця",
      recommendedProductIds: mid.map((p) => p.id),
      coachTip: "Продавай комфорт і ключ-характеристику секції, не «найбільше галочок».",
    });
  }
  if (premium.length) {
    out.push({
      id: `auto-sc-${section.id}-premium`,
      sectionId: section.id,
      clientPhrase: `Хочу топовий варіант у «${section.title}»`,
      budgetHint: "Преміум полиця",
      recommendedProductIds: premium.map((p) => p.id),
      coachTip:
        "Уточни сценарій «вау» (тиша, камера, OLED, інвертор…) — преміум має сенс лише під задачу.",
    });
  }
  return out;
}
