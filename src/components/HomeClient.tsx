"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  departments,
  getPrioritySections,
  getTrainerSteps,
  sections,
} from "@/content";
import { getSectionPercent, loadProgress } from "@/lib/progress";
import { ButtonLink, ProgressRail } from "@/components/ui";

export function HomeClient() {
  const [mounted, setMounted] = useState(false);
  const [progressTick, setProgressTick] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const progress = useMemo(() => {
    void progressTick;
    if (!mounted) return null;
    return loadProgress();
  }, [mounted, progressTick]);

  const continueSectionId =
    progress?.lastSectionId &&
    !progress.sectionProgress[progress.lastSectionId]?.completed
      ? progress.lastSectionId
      : getPrioritySections().find((s) => {
          const total = getTrainerSteps(s.id).length;
          return getSectionPercent(s.id, total) < 100;
        })?.id;

  const continueSection = sections.find((s) => s.id === continueSectionId);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <section className="rise relative overflow-hidden rounded-3xl panel px-6 py-10 sm:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-green">Comfy Floor Map</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Карта залу.
            <span className="block text-orange-soft">Впевненість на зміні.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
            Весь магазин по секціях: цінові полиці, хіти, різниці характеристик і тренажер
            «читай → розумій → відповідай клієнту».
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href={continueSection ? `/train/${continueSection.id}` : "/onboarding"}>
              {continueSection ? `Продовжити: ${continueSection.title}` : "Почати навчання"}
            </ButtonLink>
            <ButtonLink href="/scenarios" variant="soft">
              Клиент сказав…
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="rise rise-delay-1 mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Карта залу</h2>
            <p className="text-sm text-muted">Обери секцію — або вчи по черзі тренажером.</p>
          </div>
          <Link href="/search" className="text-sm font-medium text-orange-soft hover:underline">
            Пошук →
          </Link>
        </div>

        <div className="space-y-8">
          {departments
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((dep, depIndex) => {
              const depSections = sections.filter((s) => s.departmentId === dep.id);
              return (
                <div key={dep.id} className={`rise rise-delay-${Math.min(depIndex + 1, 4)}`}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-bold">{dep.title}</h3>
                    <p className="text-xs text-faint">{dep.blurb}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {depSections.map((section) => {
                      const total = getTrainerSteps(section.id).length;
                      const percent = mounted ? getSectionPercent(section.id, total || 1) : 0;
                      return (
                        <Link
                          key={section.id}
                          href={`/sections/${section.id}`}
                          className="group rounded-2xl panel p-4 transition hover:border-orange/40 hover:bg-bg-2"
                          onClick={() => setProgressTick((x) => x + 1)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold group-hover:text-orange-soft">
                                {section.title}
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs text-muted">
                                {section.summary}
                              </p>
                            </div>
                            {section.priority && (
                              <span className="shrink-0 rounded-full bg-orange/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-soft">
                                топ
                              </span>
                            )}
                          </div>
                          <div className="mt-4 space-y-1.5">
                            <div className="flex justify-between text-[11px] text-faint">
                              <span>Прогрес тренажера</span>
                              <span>{total ? `${percent}%` : "скоро"}</span>
                            </div>
                            <ProgressRail value={total ? percent : 0} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <p className="mt-12 text-center text-xs text-faint">
        Неофіційний особистий тренажер. Не є додатком Comfy і не замінює Digital Assistant.
      </p>
    </div>
  );
}
