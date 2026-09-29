"use client";

import { useState } from "react";
import Link from "next/link";
import { getSection } from "@/content";
import { getExamsForSection, pickExamPaper } from "@/content/knowledge";
import { getMastery, recordExamResult } from "@/lib/progress";
import { ButtonLink, ProgressRail } from "@/components/ui";

export function ExamClient({ sectionId }: { sectionId: string }) {
  const section = getSection(sectionId);
  const poolSize = getExamsForSection(sectionId).length;
  const [paper, setPaper] = useState(() =>
    pickExamPaper(sectionId, Math.min(10, Math.max(5, poolSize || 5))),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [weak, setWeak] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);

  const q = paper[index];
  const answeredCount = Object.keys(answers).length;
  const percent = paper.length ? Math.round((answeredCount / paper.length) * 100) : 0;

  function startNew() {
    setPaper(pickExamPaper(sectionId, Math.min(10, Math.max(5, poolSize || 5))));
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswers({});
    setWeak([]);
    setFinished(false);
    setFinalScore(0);
  }

  function submitAnswer() {
    if (!q || selected == null) return;
    const ok = !!q.options.find((o) => o.id === selected)?.correct;
    setAnswers((a) => ({ ...a, [q.id]: ok }));
    if (!ok) setWeak((w) => Array.from(new Set([...w, q.id])));
    setRevealed(true);
  }

  function next() {
    if (!revealed || !q) return;
    const nextAnswers = {
      ...answers,
      [q.id]: !!q.options.find((o) => o.id === selected)?.correct,
    };
    if (index >= paper.length - 1) {
      const correct = Object.values(nextAnswers).filter(Boolean).length;
      const scoreNow = Math.round((correct / paper.length) * 100);
      const weakIds = paper.filter((p) => nextAnswers[p.id] === false).map((p) => p.id);
      recordExamResult(sectionId, scoreNow, weakIds);
      setFinalScore(scoreNow);
      setBest(Math.max(getMastery(sectionId).examBest, scoreNow));
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  if (!section) return <div className="p-8">Секцію не знайдено</div>;

  if (poolSize === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Іспит ще наповнюється</h1>
        <ButtonLink href={`/learn/${sectionId}`} className="mt-6">
          До навчання
        </ButtonLink>
      </div>
    );
  }

  if (finished) {
    const passed = finalScore >= 80;
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-3xl panel p-8 text-center">
          <p className="text-sm font-semibold text-green">Результат іспиту</p>
          <h1 className="mt-2 text-4xl font-extrabold">{finalScore}%</h1>
          <p className="mt-3 text-muted">
            {passed
              ? "Рівень консультанта по секції: можна в зал з впевненістю."
              : "Ще не ідеально. Перечитай слабкі теми й спробуй новий квиток."}
          </p>
          <p className="mt-2 text-xs text-faint">Найкращий результат: {best}%</p>
          {weak.length > 0 && (
            <p className="mt-3 text-xs text-faint">Помилок: {weak.length}. Іди в навчання й закрий прогалини.</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={startNew}
              className="rounded-xl bg-orange px-4 py-2.5 text-sm font-semibold text-black"
            >
              Новий квиток
            </button>
            <ButtonLink href={`/learn/${sectionId}`} variant="soft">
              До навчання
            </ButtonLink>
            <ButtonLink href={`/compare?section=${sectionId}`} variant="ghost">
              Порівняння
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/learn/${sectionId}`} className="text-sm text-muted hover:text-orange-soft">
          ← Навчання: {section.title}
        </Link>
        <span className="text-xs text-faint">
          {index + 1}/{paper.length} · банк {poolSize}
        </span>
      </div>
      <div className="mt-3">
        <ProgressRail value={percent} />
      </div>

      <article className="rise mt-6 rounded-3xl panel p-6 sm:p-8">
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
          <span className="rounded-full bg-bg-2 px-2 py-1 text-muted">{q.type}</span>
          <span className="rounded-full bg-orange/15 px-2 py-1 text-orange-soft">
            складність {q.difficulty}/3
          </span>
        </div>
        <h1 className="mt-4 text-xl font-extrabold tracking-tight sm:text-2xl">{q.question}</h1>

        <div className="mt-6 space-y-2">
          {q.options.map((opt) => {
            const isSel = selected === opt.id;
            const show = revealed && isSel;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={revealed}
                onClick={() => setSelected(opt.id)}
                className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  isSel ? "border-orange bg-orange/10" : "border-line bg-bg-2/50 hover:bg-bg-2"
                } ${show && opt.correct ? "border-green bg-green/10" : ""} ${
                  show && !opt.correct ? "border-danger bg-danger/10" : ""
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-5 rounded-2xl bg-bg-2/80 p-4 text-sm leading-relaxed text-muted">
            <span className="font-semibold text-green">Розбір: </span>
            {q.explain}
          </div>
        )}
      </article>

      <div className="mt-6 flex justify-end gap-3">
        {!revealed ? (
          <button
            type="button"
            disabled={!selected}
            onClick={submitAnswer}
            className="rounded-xl bg-orange px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
          >
            Відповісти
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-orange px-4 py-2.5 text-sm font-semibold text-black"
          >
            {index >= paper.length - 1 ? "Завершити" : "Далі"}
          </button>
        )}
      </div>
    </div>
  );
}
