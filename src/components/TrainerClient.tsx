"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getProduct,
  getScenario,
  getSection,
  getTerm,
  getTrainerSteps,
} from "@/content";
import { updateProgress, loadProgress } from "@/lib/progress";
import { BandBadge, ButtonLink, ProgressRail } from "@/components/ui";

export function TrainerClient({ sectionId }: { sectionId: string }) {
  const section = getSection(sectionId);
  const steps = useMemo(() => getTrainerSteps(sectionId), [sectionId]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const saved = loadProgress().sectionProgress[sectionId];
    if (saved && !saved.completed) {
      setIndex(Math.min(saved.stepIndex, Math.max(0, steps.length - 1)));
    }
    updateProgress((prev) => ({ ...prev, lastSectionId: sectionId }));
  }, [sectionId, steps.length]);

  if (!section) {
    return <div className="p-8">Секцію не знайдено</div>;
  }

  if (steps.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{section.title}</h1>
        <p className="mt-3 text-muted">
          Тренажер для цієї секції ще наповнюється. Заглянь у полиці й хіти.
        </p>
        <div className="mt-6">
          <ButtonLink href={`/sections/${sectionId}`}>До секції</ButtonLink>
        </div>
      </div>
    );
  }

  const step = steps[index];
  const percent = Math.round(((index + (step.type === "summary" ? 1 : 0)) / steps.length) * 100);

  function persist(nextIndex: number, completed = false, weakId?: string) {
    updateProgress((prev) => {
      const current = prev.sectionProgress[sectionId] ?? {
        completed: false,
        stepIndex: 0,
        weakStepIds: [],
        updatedAt: Date.now(),
      };
      const weakStepIds = weakId
        ? Array.from(new Set([...current.weakStepIds, weakId]))
        : current.weakStepIds;
      return {
        ...prev,
        lastSectionId: sectionId,
        sectionProgress: {
          ...prev.sectionProgress,
          [sectionId]: {
            completed,
            stepIndex: nextIndex,
            weakStepIds,
            updatedAt: Date.now(),
          },
        },
      };
    });
  }

  function next(opts?: { wrong?: boolean }) {
    const weakId = opts?.wrong ? step.id : undefined;
    if (index >= steps.length - 1) {
      persist(steps.length - 1, true, weakId);
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setSelected(null);
    setRevealed(false);
    persist(nextIndex, nextIndex === steps.length - 1, weakId);
  }

  function prev() {
    if (index === 0) return;
    const nextIndex = index - 1;
    setIndex(nextIndex);
    setSelected(null);
    setRevealed(false);
    persist(nextIndex);
  }

  const term = step.termId ? getTerm(step.termId) : null;
  const product = step.productId ? getProduct(step.productId) : null;
  const scenario = step.scenarioId ? getScenario(step.scenarioId) : null;
  const compareItems = (step.compareIds ?? [])
    .map((id) => getProduct(id))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/sections/${sectionId}`} className="text-sm text-muted hover:text-orange-soft">
          ← {section.title}
        </Link>
        <span className="text-xs text-faint">
          {index + 1} / {steps.length}
        </span>
      </div>
      <div className="mt-3">
        <ProgressRail value={percent} />
      </div>

      <article className="rise mt-6 rounded-3xl panel p-6 sm:p-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-green">
          {step.type === "quiz"
            ? "Квіз"
            : step.type === "summary"
              ? "Підсумок"
              : step.type === "intro"
                ? "Старт"
                : "Крок"}
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {step.title}
        </h1>
        <p className="mt-2 text-muted">{step.body}</p>

        {term && (
          <div className="mt-6 rounded-2xl bg-bg-2/80 p-4">
            <div className="text-lg font-bold text-orange-soft">{term.title}</div>
            <p className="mt-2 leading-relaxed">{term.plainExplain}</p>
          </div>
        )}

        {step.type === "band" && (
          <div className="mt-6 grid gap-3">
            {section.priceBands.map((b) => (
              <div key={b.id} className="rounded-2xl bg-bg-2/80 p-4">
                <BandBadge band={b.id} />
                <p className="mt-2 text-sm text-muted">{b.forWhom}</p>
              </div>
            ))}
          </div>
        )}

        {product && (
          <div className="mt-6 space-y-3 rounded-2xl bg-bg-2/80 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <BandBadge band={product.bandId} />
              <span className="font-bold">
                {product.brand} · {product.name}
              </span>
            </div>
            <p className="text-sm text-muted">{product.forWhom}</p>
            <p className="leading-relaxed">{product.pitch}</p>
            <ul className="space-y-1 text-sm text-muted">
              {product.pros.map((p) => (
                <li key={p}>▸ {p}</li>
              ))}
            </ul>
            <Link href={`/products/${product.id}`} className="text-sm text-orange-soft hover:underline">
              Відкрити картку →
            </Link>
          </div>
        )}

        {compareItems.length > 0 && (
          <div className="mt-6 grid gap-3">
            {compareItems.map((p) =>
              p ? (
                <div key={p.id} className="rounded-2xl bg-bg-2/80 p-4">
                  <div className="font-semibold">
                    {p.brand} · {p.name}
                  </div>
                  <p className="mt-1 text-sm text-muted">{p.pitch}</p>
                </div>
              ) : null,
            )}
            <Link
              href={`/compare?ids=${compareItems.map((p) => p?.id).filter(Boolean).join(",")}`}
              className="text-sm text-orange-soft hover:underline"
            >
              Повна таблиця порівняння →
            </Link>
          </div>
        )}

        {scenario && (
          <div className="mt-6 rounded-2xl bg-bg-2/80 p-4">
            <div className="text-lg font-semibold">«{scenario.clientPhrase}»</div>
            <p className="mt-2 text-sm text-green">{scenario.budgetHint}</p>
            <p className="mt-2 text-sm text-muted">{scenario.coachTip}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {scenario.recommendedProductIds.map((id) => {
                const p = getProduct(id);
                if (!p) return null;
                return (
                  <Link
                    key={id}
                    href={`/products/${id}`}
                    className="rounded-full bg-bg-0 px-3 py-1 text-xs hover:text-orange-soft"
                  >
                    {p.brand} {p.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {step.quiz && (
          <div className="mt-6 space-y-2">
            {step.quiz.options.map((opt) => {
              const isSel = selected === opt.id;
              const show = revealed && isSel;
              const ok = opt.correct;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(opt.id)}
                  className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    isSel ? "border-orange bg-orange/10" : "border-line bg-bg-2/50 hover:bg-bg-2"
                  } ${show && ok ? "border-green bg-green/10" : ""} ${
                    show && !ok ? "border-danger bg-danger/10" : ""
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
            {revealed && (
              <p className="pt-2 text-sm text-muted">{step.quiz.explain}</p>
            )}
          </div>
        )}

        {step.type === "summary" && (
          <div className="mt-6 rounded-2xl bg-green/10 p-4 text-sm text-green">
            Прогрес збережено локально на цьому пристрої. Завтра повтори слабкі місця або візьми
            наступну пріоритетну секцію.
          </div>
        )}
      </article>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          className="rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-bg-2 disabled:opacity-30"
        >
          Назад
        </button>

        {step.quiz && !revealed ? (
          <button
            type="button"
            disabled={!selected}
            onClick={() => setRevealed(true)}
            className="rounded-xl bg-orange px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
          >
            Перевірити
          </button>
        ) : step.type === "summary" ? (
          <ButtonLink href="/">На карту залу</ButtonLink>
        ) : (
          <button
            type="button"
            onClick={() => {
              const wrong =
                !!step.quiz &&
                selected != null &&
                !step.quiz.options.find((o) => o.id === selected)?.correct;
              next({ wrong });
            }}
            className="rounded-xl bg-orange px-4 py-2.5 text-sm font-semibold text-black"
          >
            Далі
          </button>
        )}
      </div>
    </div>
  );
}
