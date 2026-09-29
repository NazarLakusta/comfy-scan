import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductsByBand,
  getSection,
  getTermsBySection,
  getScenariosBySection,
  getProductsBySection,
  sections,
} from "@/content";
import { BandBadge, ButtonLink } from "@/components/ui";
import { NotesBox } from "@/components/NotesBox";
import { formatPriceBand } from "@/lib/utils";

export function generateStaticParams() {
  return sections.map((s) => ({ id: s.id }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = getSection(id);
  if (!section) notFound();

  const terms = getTermsBySection(id);
  const scenarios = getScenariosBySection(id);
  const sectionProducts = getProductsBySection(id);
  const totalProducts = sectionProducts.length;
  const canCompare = totalProducts >= 2;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm text-muted hover:text-orange-soft">
        ← Карта залу
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {section.title}
          </h1>
          <p className="mt-2 text-muted">{section.summary}</p>
          <p className="mt-2 text-xs text-faint">{totalProducts} товарів у каталозі цієї секції</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/train/${section.id}`}>Вчити секцію</ButtonLink>
          <ButtonLink href={`/catalog?section=${section.id}`} variant="soft">
            Каталог секції
          </ButtonLink>
          {canCompare ? (
            <ButtonLink href={`/compare?section=${section.id}`} variant="ghost">
              Порівняти
            </ButtonLink>
          ) : null}
        </div>
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {section.priceBands.map((band) => {
          const items = getProductsByBand(section.id, band.id);
          return (
            <div key={band.id} className="rounded-2xl panel p-4">
              <div className="flex items-center justify-between gap-2">
                <BandBadge band={band.id} />
                <span className="text-xs text-faint">
                  {formatPriceBand(band.priceFrom, band.priceTo)}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted">{band.forWhom}</p>
              <ul className="mt-4 space-y-2">
                {items.length === 0 && (
                  <li className="text-sm text-faint">Хіти з’являться пізніше</li>
                )}
                {items.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      className="block rounded-xl bg-bg-2/70 px-3 py-2 transition hover:bg-bg-2"
                    >
                      <div className="text-sm font-semibold">
                        {p.brand} · {p.name}
                      </div>
                      <div className="text-xs text-muted">
                        {p.price != null
                          ? `${p.price.toLocaleString("uk-UA")} ₴ · ${p.forWhom}`
                          : p.forWhom}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {terms.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Головні характеристики</h2>
          <p className="mt-1 text-sm text-muted">
            Словник секції — те, що пояснюєш клієнту простими словами.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {terms.map((t) => (
              <div key={t.id} className="rounded-2xl panel p-4">
                <div className="font-semibold text-green">{t.title}</div>
                <p className="mt-2 text-sm text-muted">{t.plainExplain}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-bold">Ключі для порівняння</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {section.compareKeys.map((k) => (
            <span key={k.key} className="rounded-full bg-bg-2 px-3 py-1.5 text-sm text-muted">
              {k.label}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {canCompare ? (
            <ButtonLink href={`/compare?section=${section.id}`} variant="soft">
              Порівняти моделі секції
            </ButtonLink>
          ) : (
            <span className="text-sm text-faint">Для порівняння потрібно ≥2 моделі</span>
          )}
        </div>
      </section>

      <section className="mt-10">
        <NotesBox noteKey={`section:${section.id}`} label="Мої нотатки по секції" />
      </section>

      {scenarios.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Типові запити</h2>
          <div className="mt-4 grid gap-3">
            {scenarios.map((s) => (
              <Link
                key={s.id}
                href={`/scenarios#${s.id}`}
                className="rounded-2xl panel p-4 transition hover:border-orange/40"
              >
                <div className="text-sm font-semibold">«{s.clientPhrase}»</div>
                <div className="mt-1 text-xs text-faint">{s.budgetHint}</div>
                <p className="mt-2 text-sm text-muted">{s.coachTip}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
