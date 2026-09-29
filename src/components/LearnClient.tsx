"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getModulesForSection,
  getTopic,
  getTopicsForSection,
} from "@/content/knowledge";
import { getSection } from "@/content";
import {
  getMastery,
  markModuleDone,
  markTopicRead,
  masteryScore,
} from "@/lib/progress";
import { ButtonLink, ProgressRail } from "@/components/ui";

export function LearnClient({ sectionId }: { sectionId: string }) {
  const section = getSection(sectionId);
  const topics = useMemo(() => getTopicsForSection(sectionId), [sectionId]);
  const modules = useMemo(() => getModulesForSection(sectionId), [sectionId]);
  const [activeId, setActiveId] = useState(topics[0]?.id);
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => setMounted(true), []);

  const mastery = useMemo(() => {
    void tick;
    return mounted ? getMastery(sectionId) : null;
  }, [mounted, sectionId, tick]);

  const active = getTopic(activeId || "") || topics[0];
  const score =
    mounted && topics.length
      ? masteryScore(sectionId, topics.length)
      : 0;

  if (!section) {
    return <div className="p-8">Секцію не знайдено</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={`/sections/${sectionId}`} className="text-sm text-muted hover:text-orange-soft">
        ← {section.title}
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green">Навчання з нуля</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {section.title}: розжуй параметри
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Читай тему → зрозумій «що казати» → закрий модуль → йди на іспит. Без води «середній для дому».
          </p>
        </div>
        <div className="min-w-[180px]">
          <div className="mb-1 flex justify-between text-xs text-faint">
            <span>Опанування</span>
            <span>{score}%</span>
          </div>
          <ProgressRail value={score} />
          <div className="mt-3">
            <ButtonLink href={`/exam/${sectionId}`}>Іспит по секції</ButtonLink>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          {modules.map((mod) => (
            <div key={mod.id} className="rounded-2xl panel p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-green">
                Модуль {mod.order}
              </div>
              <div className="mt-1 font-semibold">{mod.title}</div>
              <p className="mt-1 text-xs text-muted">{mod.goal}</p>
              <ul className="mt-3 space-y-1">
                {mod.topicIds.map((tid) => {
                  const t = getTopic(tid);
                  const read = mastery?.topicsRead.includes(tid);
                  return (
                    <li key={tid}>
                      <button
                        type="button"
                        onClick={() => setActiveId(tid)}
                        className={`w-full rounded-lg px-2 py-1.5 text-left text-sm ${
                          activeId === tid
                            ? "bg-orange/15 text-orange-soft"
                            : "hover:bg-bg-2 text-muted"
                        }`}
                      >
                        {read ? "✓ " : ""}
                        {t?.title || tid}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-green hover:underline"
                onClick={() => {
                  markModuleDone(sectionId, mod.id);
                  for (const tid of mod.topicIds) markTopicRead(sectionId, tid);
                  setTick((x) => x + 1);
                }}
              >
                Позначити модуль пройденим
              </button>
            </div>
          ))}
        </aside>

        {active && (
          <article className="rise rounded-3xl panel p-6 sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-wide text-orange-soft">
              Тема
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {active.title}
            </h2>

            <section className="mt-6">
              <h3 className="font-bold text-green">З нуля</h3>
              <p className="mt-2 leading-relaxed text-muted">{active.eli5}</p>
            </section>

            <section className="mt-6">
              <h3 className="font-bold text-green">Чому це важливо в залі</h3>
              <p className="mt-2 leading-relaxed text-muted">{active.whyMatters}</p>
            </section>

            <section className="mt-6 rounded-2xl bg-orange/10 p-4">
              <h3 className="font-bold text-orange-soft">Що казати клієнту</h3>
              <p className="mt-2 leading-relaxed">{active.sayThis}</p>
            </section>

            <section className="mt-6">
              <h3 className="font-bold text-green">Логіка ціни</h3>
              <p className="mt-2 leading-relaxed text-muted">{active.priceLogic}</p>
            </section>

            <section className="mt-6">
              <h3 className="font-bold text-green">Під задачі</h3>
              <ul className="mt-3 space-y-2">
                {active.forTasks.map((t) => (
                  <li key={t.task} className="rounded-xl bg-bg-2/70 px-3 py-2 text-sm">
                    <span className="font-semibold">{t.task}: </span>
                    <span className="text-muted">{t.pick}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-6">
              <h3 className="font-bold text-green">Міфи / помилки</h3>
              <ul className="mt-2 space-y-2 text-sm text-muted">
                {active.myths.map((m) => (
                  <li key={m}>▸ {m}</li>
                ))}
              </ul>
            </section>

            <section className="mt-6">
              <h3 className="font-bold text-green">Як порівнювати на полиці</h3>
              <p className="mt-2 text-muted">{active.compareTip}</p>
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl bg-orange px-4 py-2.5 text-sm font-semibold text-black"
                onClick={() => {
                  markTopicRead(sectionId, active.id);
                  setTick((x) => x + 1);
                  const idx = topics.findIndex((t) => t.id === active.id);
                  if (idx >= 0 && idx < topics.length - 1) setActiveId(topics[idx + 1].id);
                }}
              >
                Зрозумів · далі
              </button>
              <ButtonLink href={`/exam/${sectionId}`} variant="soft">
                Перевірити іспитом
              </ButtonLink>
              <ButtonLink href={`/compare?section=${sectionId}`} variant="ghost">
                Порівняти моделі
              </ButtonLink>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
