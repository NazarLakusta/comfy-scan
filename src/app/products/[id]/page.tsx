import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProduct,
  getSection,
  products,
  bandLabel,
} from "@/content";
import { BandBadge, ButtonLink } from "@/components/ui";
import { NotesBox } from "@/components/NotesBox";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  const section = getSection(product.sectionId);
  const related = product.relatedIds.map((rid) => getProduct(rid)).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/sections/${product.sectionId}`}
        className="text-sm text-muted hover:text-orange-soft"
      >
        ← {section?.title ?? "Секція"}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <BandBadge band={product.bandId} />
        {product.isHit && (
          <span className="rounded-full bg-green/15 px-2.5 py-1 text-xs font-semibold text-green">
            Хіт
          </span>
        )}
        <span className="text-xs text-faint">{bandLabel(product.bandId)} полиця</span>
      </div>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
        {product.brand}
        <span className="block text-orange-soft">{product.name}</span>
      </h1>
      <p className="mt-3 text-muted">{product.forWhom}</p>
      {product.price != null && (
        <p className="mt-2 text-2xl font-bold text-green">
          ~{product.price.toLocaleString("uk-UA")} ₴
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <ButtonLink href={`/train/${product.sectionId}`} variant="soft">
          Вчити секцію
        </ButtonLink>
        <ButtonLink href={`/catalog?section=${product.sectionId}`} variant="ghost">
          Каталог секції
        </ButtonLink>
        {product.sourceUrl && (
          <a
            href={product.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-muted hover:bg-bg-2 hover:text-text"
          >
            Comfy.ua ↗
          </a>
        )}
      </div>

      <div className="mt-6 rounded-2xl panel p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-green">
          Мова продавця
        </div>
        <p className="mt-2 text-lg leading-relaxed">{product.pitch}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl panel p-4">
          <h2 className="font-bold">3 сильні сторони</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {product.pros.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-green">▸</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl panel p-4">
          <h2 className="font-bold">Коли не брати</h2>
          <p className="mt-3 text-sm text-muted">{product.con}</p>
          <h3 className="mt-4 text-sm font-semibold">Допродаж</h3>
          <p className="mt-1 text-sm text-muted">{product.upsell.join(" · ")}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl panel p-4">
        <h2 className="font-bold">Головні характеристики</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {Object.entries(product.specs).map(([k, v]) => {
            const label = section?.compareKeys.find((c) => c.key === k)?.label ?? k;
            return (
              <div key={k} className="rounded-xl bg-bg-2/60 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-faint">{label}</dt>
                <dd className="text-sm font-medium">{v}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      {related.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold">Порівняти з</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((r) =>
              r ? (
                <ButtonLink
                  key={r.id}
                  href={`/compare?ids=${product.id},${r.id}`}
                  variant="soft"
                >
                  vs {r.brand} {r.name}
                </ButtonLink>
              ) : null,
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <NotesBox noteKey={`product:${product.id}`} label="Мої слова" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {product.tags.map((t) => (
          <Link
            key={t}
            href={`/search?q=${encodeURIComponent(t)}`}
            className="rounded-full bg-bg-2 px-3 py-1 text-xs text-muted hover:bg-bg-1 hover:text-orange-soft"
          >
            #{t}
          </Link>
        ))}
      </div>
    </div>
  );
}
