export type PriceBandId = "budget" | "mid" | "premium";

export type Department = {
  id: string;
  title: string;
  blurb: string;
  order: number;
};

export type PriceBand = {
  id: PriceBandId;
  label: string;
  priceFrom: number;
  priceTo?: number;
  forWhom: string;
};

export type Section = {
  id: string;
  departmentId: string;
  title: string;
  summary: string;
  priority: boolean;
  compareKeys: { key: string; label: string }[];
  priceBands: PriceBand[];
};

export type Product = {
  id: string;
  sectionId: string;
  bandId: PriceBandId;
  brand: string;
  name: string;
  tags: string[];
  forWhom: string;
  pros: string[];
  con: string;
  upsell: string[];
  pitch: string;
  specs: Record<string, string>;
  isHit: boolean;
  relatedIds: string[];
};

export type Term = {
  id: string;
  sectionId: string;
  title: string;
  plainExplain: string;
};

export type Scenario = {
  id: string;
  sectionId: string;
  clientPhrase: string;
  budgetHint: string;
  recommendedProductIds: string[];
  coachTip: string;
};

export type TrainerStepType =
  | "intro"
  | "term"
  | "band"
  | "product"
  | "compare"
  | "scenario"
  | "quiz"
  | "summary";

export type QuizOption = {
  id: string;
  label: string;
  correct?: boolean;
};

export type TrainerStep = {
  id: string;
  sectionId: string;
  type: TrainerStepType;
  title: string;
  body: string;
  termId?: string;
  productId?: string;
  compareIds?: string[];
  scenarioId?: string;
  quiz?: {
    question: string;
    options: QuizOption[];
    explain: string;
  };
};
