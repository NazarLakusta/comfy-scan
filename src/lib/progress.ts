"use client";

export type MasterySection = {
  topicsRead: string[];
  modulesDone: string[];
  examBest: number;
  examAttempts: number;
  weakQuestionIds: string[];
  updatedAt: number;
};

export type ProgressState = {
  onboardingDone: boolean;
  sectionProgress: Record<
    string,
    {
      completed: boolean;
      stepIndex: number;
      weakStepIds: string[];
      updatedAt: number;
    }
  >;
  mastery: Record<string, MasterySection>;
  notes: Record<string, string>;
  lastSectionId?: string;
};

const KEY = "comfy-floor-map-progress-v2";

const empty: ProgressState = {
  onboardingDone: false,
  sectionProgress: {},
  mastery: {},
  notes: {},
};

function migrate(raw: Record<string, unknown>): ProgressState {
  return {
    ...empty,
    ...raw,
    mastery: (raw.mastery as ProgressState["mastery"]) || {},
    sectionProgress: (raw.sectionProgress as ProgressState["sectionProgress"]) || {},
    notes: (raw.notes as ProgressState["notes"]) || {},
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return empty;
  try {
    const v2 = localStorage.getItem(KEY);
    if (v2) return migrate(JSON.parse(v2));
    const v1 = localStorage.getItem("comfy-floor-map-progress-v1");
    if (v1) {
      const migrated = migrate(JSON.parse(v1));
      saveProgress(migrated);
      return migrated;
    }
    return empty;
  } catch {
    return empty;
  }
}

export function saveProgress(next: ProgressState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function updateProgress(mutator: (prev: ProgressState) => ProgressState) {
  const prev = loadProgress();
  const next = mutator(prev);
  saveProgress(next);
  return next;
}

export function getSectionPercent(sectionId: string, totalSteps: number) {
  const p = loadProgress().sectionProgress[sectionId];
  if (!p || totalSteps <= 0) return 0;
  if (p.completed) return 100;
  return Math.min(99, Math.round((p.stepIndex / totalSteps) * 100));
}

export function getMastery(sectionId: string): MasterySection {
  return (
    loadProgress().mastery[sectionId] || {
      topicsRead: [],
      modulesDone: [],
      examBest: 0,
      examAttempts: 0,
      weakQuestionIds: [],
      updatedAt: 0,
    }
  );
}

export function markTopicRead(sectionId: string, topicId: string) {
  return updateProgress((prev) => {
    const cur = prev.mastery[sectionId] || {
      topicsRead: [],
      modulesDone: [],
      examBest: 0,
      examAttempts: 0,
      weakQuestionIds: [],
      updatedAt: Date.now(),
    };
    return {
      ...prev,
      lastSectionId: sectionId,
      mastery: {
        ...prev.mastery,
        [sectionId]: {
          ...cur,
          topicsRead: Array.from(new Set([...cur.topicsRead, topicId])),
          updatedAt: Date.now(),
        },
      },
    };
  });
}

export function markModuleDone(sectionId: string, moduleId: string) {
  return updateProgress((prev) => {
    const cur = prev.mastery[sectionId] || getMastery(sectionId);
    return {
      ...prev,
      mastery: {
        ...prev.mastery,
        [sectionId]: {
          ...cur,
          modulesDone: Array.from(new Set([...cur.modulesDone, moduleId])),
          updatedAt: Date.now(),
        },
      },
    };
  });
}

export function recordExamResult(
  sectionId: string,
  scorePercent: number,
  weakIds: string[],
) {
  return updateProgress((prev) => {
    const cur = prev.mastery[sectionId] || getMastery(sectionId);
    return {
      ...prev,
      lastSectionId: sectionId,
      mastery: {
        ...prev.mastery,
        [sectionId]: {
          ...cur,
          examAttempts: cur.examAttempts + 1,
          examBest: Math.max(cur.examBest, scorePercent),
          weakQuestionIds: Array.from(new Set([...cur.weakQuestionIds, ...weakIds])).slice(-40),
          updatedAt: Date.now(),
        },
      },
    };
  });
}

/** 0-100 combined mastery: topics + exam */
export function masteryScore(
  sectionId: string,
  totalTopics: number,
  passExam = 80,
): number {
  const m = getMastery(sectionId);
  const topicPart =
    totalTopics <= 0 ? 0 : Math.min(1, m.topicsRead.length / totalTopics) * 55;
  const examPart = Math.min(1, m.examBest / 100) * 45;
  const bonus = m.examBest >= passExam ? 0 : 0;
  return Math.round(topicPart + examPart + bonus);
}
