"use client";

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
  notes: Record<string, string>;
  lastSectionId?: string;
};

const KEY = "comfy-floor-map-progress-v1";

const empty: ProgressState = {
  onboardingDone: false,
  sectionProgress: {},
  notes: {},
};

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) } as ProgressState;
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
