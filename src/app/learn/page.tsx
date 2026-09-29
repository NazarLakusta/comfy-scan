import Link from "next/link";
import { sections } from "@/content";
import { getSectionKnowledgeCoverage } from "@/content/knowledge";
import { ButtonLink } from "@/components/ui";

export default function LearnIndexPage() {
  const coverage = getSectionKnowledgeCoverage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold text-green">Школа консультанта</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Навчання з нуля по всьому залу
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Обери секцію → розжуй параметри → склади іспит на 80%+. Це не «середній для дому», а вміння
        пояснити Герци, матриці, чипи й мікрофони клієнту.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coverage.map((c) => {
          const section = sections.find((s) => s.id === c.id);
          return (
            <div key={c.id} className="rounded-2xl panel p-4">
              <div className="font-semibold">{c.title}</div>
              <p className="mt-1 text-xs text-faint">
                {c.topics} тем · {c.modules} модулів · {c.exams} питань іспиту
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-muted">{section?.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink href={`/learn/${c.id}`} className="!py-2 !text-xs">
                  Навчання
                </ButtonLink>
                <ButtonLink href={`/exam/${c.id}`} variant="soft" className="!py-2 !text-xs">
                  Іспит
                </ButtonLink>
                <ButtonLink href={`/compare?section=${c.id}`} variant="ghost" className="!py-2 !text-xs">
                  Порівняти
                </ButtonLink>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
