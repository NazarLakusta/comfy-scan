"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSection, getTrainerSteps, sections } from "@/content";
import { loadProgress } from "@/lib/progress";
import { ButtonLink, ProgressRail } from "@/components/ui";

export function ReviewClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = useMemo(() => {
    if (!mounted) {
      return {
        weak: [] as string[],
        sectionStats: [] as { id: string; title: string; percent: number; weak: number }[],
      };
    }
    const progress = loadProgress();
    const weak: string[] = [];
    const sectionStats = sections.map((s) => {
      const steps = getTrainerSteps(s.id);
      const p = progress.sectionProgress[s.id];
      const percent = !p
        ? 0
        : p.completed
          ? 100
          : Math.min(99, Math.round((p.stepIndex / Math.max(steps.length, 1)) * 100));
      const weakCount = p?.weakStepIds?.length ?? 0;
      for (const id of p?.weakStepIds ?? []) weak.push(id);
      return { id: s.id, title: s.title, percent, weak: weakCount };
    });
    return { weak, sectionStats: sectionStats.filter((s) => s.percent > 0 || s.weak > 0) };
  }, [mounted]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Повторення</h1>
      <p className="mt-2 text-muted">
        Слабкі квізи і прогрес по секціях. Тисни й добивай прогалини.
      </p>

      {!mounted && <p className="mt-8 text-faint">Завантаження…</p>}

      {mounted && data.sectionStats.length === 0 && (
        <div className="mt-8 rounded-2xl panel p-6">
          <p className="text-muted">Ще немає прогресу. Пройди будь-який тренажер.</p>
          <div className="mt-4">
            <ButtonLink href="/train/smartphones">Почати зі смартфонів</ButtonLink>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {data.sectionStats.map((s) => (
          <Link
            key={s.id}
            href={`/train/${s.id}`}
            className="block rounded-2xl panel p-4 transition hover:border-orange/40"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{s.title}</div>
              <div className="text-xs text-faint">
                {s.percent}%{s.weak ? ` · слабких ${s.weak}` : ""}
              </div>
            </div>
            <div className="mt-3">
              <ProgressRail value={s.percent} />
            </div>
          </Link>
        ))}
      </div>

      {data.weak.length > 0 && (
        <div className="mt-10">
          <h2 className="font-bold">Слабкі кроки</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {data.weak.slice(0, 20).map((id) => {
              const section = sections.find((s) => id.includes(s.id));
              return (
                <li key={id} className="rounded-xl bg-bg-2/70 px-3 py-2">
                  <code className="text-xs text-faint">{id}</code>
                  {section && (
                    <div>
                      <Link
                        href={`/train/${section.id}`}
                        className="text-orange-soft hover:underline"
                      >
                        Повторити {getSection(section.id)?.title}
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <ButtonLink href="/catalog" variant="soft">
          Каталог
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          ← Карта залу
        </ButtonLink>
      </div>
    </div>
  );
}
