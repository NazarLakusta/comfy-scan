import type { ExamQuestion, KnowledgeTopic, LearnModule } from "./types";
import { examQuestions, knowledgeTopics, learnModules } from "./bank";
import { sections } from "../sections";

export type { ExamQuestion, KnowledgeTopic, LearnModule } from "./types";
export { examQuestions, knowledgeTopics, learnModules };

export function getTopicsForSection(sectionId: string): KnowledgeTopic[] {
  return knowledgeTopics.filter((t) => t.sectionId === sectionId);
}

export function getTopic(id: string) {
  return knowledgeTopics.find((t) => t.id === id);
}

export function getModulesForSection(sectionId: string): LearnModule[] {
  return learnModules
    .filter((m) => m.sectionId === sectionId)
    .sort((a, b) => a.order - b.order);
}

export function getExamsForSection(sectionId: string, difficulty?: 1 | 2 | 3): ExamQuestion[] {
  return examQuestions.filter(
    (q) => q.sectionId === sectionId && (difficulty == null || q.difficulty === difficulty),
  );
}

export function getSectionKnowledgeCoverage() {
  return sections.map((s) => ({
    id: s.id,
    title: s.title,
    topics: getTopicsForSection(s.id).length,
    modules: getModulesForSection(s.id).length,
    exams: getExamsForSection(s.id).length,
  }));
}

export function pickExamPaper(sectionId: string, count = 10): ExamQuestion[] {
  const all = getExamsForSection(sectionId);
  if (all.length <= count) return all.slice();
  // mix difficulties
  const d1 = all.filter((q) => q.difficulty === 1);
  const d2 = all.filter((q) => q.difficulty === 2);
  const d3 = all.filter((q) => q.difficulty === 3);
  const take = (arr: ExamQuestion[], n: number) => {
    const copy = arr.slice().sort(() => Math.random() - 0.5);
    return copy.slice(0, n);
  };
  const paper = [
    ...take(d1, Math.min(3, d1.length)),
    ...take(d2, Math.min(4, d2.length)),
    ...take(d3, Math.min(3, d3.length)),
  ];
  while (paper.length < count) {
    const extra = all[Math.floor(Math.random() * all.length)];
    if (!paper.find((p) => p.id === extra.id)) paper.push(extra);
    else break;
  }
  return paper.slice(0, count).sort(() => Math.random() - 0.5);
}
