export type KnowledgeTopic = {
  id: string;
  sectionId: string;
  title: string;
  /** Absolute beginner explanation */
  eli5: string;
  /** Why the customer / sale cares */
  whyMatters: string;
  /** Exact words a consultant can say */
  sayThis: string;
  /** Common wrong advice to avoid */
  myths: string[];
  /** How it drives price difference */
  priceLogic: string;
  /** Task → what to recommend */
  forTasks: { task: string; pick: string }[];
  /** What to compare on the shelf */
  compareTip: string;
};

export type ExamQuestion = {
  id: string;
  sectionId: string;
  difficulty: 1 | 2 | 3;
  type: "scenario" | "compare" | "concept" | "myth" | "pitch";
  question: string;
  options: { id: string; label: string; correct?: boolean }[];
  explain: string;
};

export type LearnModule = {
  id: string;
  sectionId: string;
  order: number;
  title: string;
  goal: string;
  topicIds: string[];
};
