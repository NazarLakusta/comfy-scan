"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  departments,
  getCatalogStats,
  getPrioritySections,
  getProductsBySection,
  getTrainerSteps,
  sections,
} from "@/content";
import { getSectionPercent, loadProgress } from "@/lib/progress";
import { ButtonLink, ProgressRail } from "@/components/ui";

export function HomeClient() {
  const [mounted, setMounted] = useState(false);
  const stats = getCatalogStats();

  useEffect(() => {
    setMounted(true);
  }, []);

  const progress = useMemo(() => {
    if (!mounted) return null;
    return loadProgress();
  }, [mounted]);

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
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-orange/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-green/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-green">Comfy Floor Map</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Карта залу.
            <span className="block text-orange-soft">Впевненість на зміні.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
            {stats.products} товарів у тренажері · глибокі теми · серйозні іспити.
            Навчись пояснювати Герци, матриці, чипи й мікрофони — не ярлики полиць.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/learn">Школа з нуля</ButtonLink>
            <ButtonLink href={continueSection ? `/learn/${continueSection.id}` : "/learn/smartphones"} variant="soft">
              {continueSection ? `Вчити: ${continueSection.title}` : "Почати зі смартфонів"}
            </ButtonLink>
            <ButtonLink href="/comfy-map" variant="ghost">
              Усі категорії Comfy
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="rise rise-delay-1 mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Карта залу</h2>
            <p className="text-sm text-muted">Департамент → секція → полиці → тренажер.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/catalog" className="font-medium text-orange-soft hover:underline">
              Каталог →
            </Link>
            <Link href="/review" className="font-medium text-muted hover:text-orange-soft">
              Повторити →
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {departments
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((dep) => {
              const depSections = sections.filter((s) => s.departmentId === dep.id);
              return (
                <div key={dep.id}>
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                    <Link href={`/departments/${dep.id}`} className="group">
                      <h3 className="text-lg font-bold group-hover:text-orange-soft">
                        {dep.title} →
                      </h3>
                    </Link>
                    <p className="text-xs text-faint">{dep.blurb}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {depSections.map((section) => {
                      const total = getTrainerSteps(section.id).length;
                      const count = getProductsBySection(section.id).length;
                      const percent = mounted ? getSectionPercent(section.id, total || 1) : 0;
                      return (
                        <div
                          key={section.id}
                          className="rounded-2xl panel p-4 transition hover:border-orange/40"
                        >
                          <Link href={`/sections/${section.id}`} className="block">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold hover:text-orange-soft">
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
                            <div className="mt-3 text-[11px] text-faint">
                              {count} товарів · {total} кроків
                            </div>
                            <div className="mt-2 space-y-1.5">
                              <div className="flex justify-between text-[11px] text-faint">
                                <span>Прогрес</span>
                                <span>{percent}%</span>
                              </div>
                              <ProgressRail value={percent} />
                            </div>
                          </Link>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href={`/learn/${section.id}`}
                              className="rounded-lg bg-orange px-3 py-1.5 text-xs font-semibold text-black"
                            >
                              Навчання
                            </Link>
                            <Link
                              href={`/exam/${section.id}`}
                              className="rounded-lg bg-bg-2 px-3 py-1.5 text-xs font-semibold text-muted hover:text-text"
                            >
                              Іспит
                            </Link>
                            <Link
                              href={`/train/${section.id}`}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:bg-bg-2 hover:text-text"
                            >
                              Шпаргалка
                            </Link>
                            <Link
                              href={`/compare?section=${section.id}`}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:bg-bg-2 hover:text-text"
                            >
                              Порівняти
                            </Link>
                          </div>
                        </div>
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
        Live-парсер: <code className="text-muted">npm run parse:comfy</code> у WSL.
      </p>
    </div>
  );
}
