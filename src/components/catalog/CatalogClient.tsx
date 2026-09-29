"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  filterCatalog,
  getAllBrands,
  getCatalogStats,
  getSection,
  sections,
  type PriceBandId,
} from "@/content";
import { BandBadge, ButtonLink } from "@/components/ui";

function CatalogInner() {
  const params = useSearchParams();
  const stats = getCatalogStats();
  const brands = getAllBrands();
  const [sectionId, setSectionId] = useState(params.get("section") ?? "");
  const [bandId, setBandId] = useState<PriceBandId | "all">("all");
  const [brand, setBrand] = useState("");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [hitsOnly, setHitsOnly] = useState(false);

  useEffect(() => {
    const s = params.get("section");
    if (s) setSectionId(s);
    const qq = params.get("q");
    if (qq) setQ(qq);
  }, [params]);

  const list = useMemo(
    () =>
      filterCatalog({
        sectionId: sectionId || undefined,
        bandId,
        brand: brand || undefined,
        q,
        hitsOnly,
      }),
    [sectionId, bandId, brand, q, hitsOnly],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green">Каталог залу</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Усі товари під рукою
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            {stats.products} позицій · {stats.sections} секцій · seed {stats.seed}
            {stats.live ? ` · live ${stats.live}` : ""}. Фільтруй полиці й вчи різниці.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/compare" variant="soft">
            Порівняти
          </ButtonLink>
          <ButtonLink href="/train/smartphones">Тренажер</ButtonLink>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl panel p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs text-faint">
          Секція
          <select
            className="mt-1 w-full rounded-xl border border-line bg-bg-0 px-3 py-2 text-sm text-text"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            <option value="">Усі секції</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-faint">
          Полиця
          <select
            className="mt-1 w-full rounded-xl border border-line bg-bg-0 px-3 py-2 text-sm text-text"
            value={bandId}
            onChange={(e) => setBandId(e.target.value as PriceBandId | "all")}
          >
            <option value="all">Усі</option>
            <option value="budget">Бюджет</option>
            <option value="mid">Середній</option>
            <option value="premium">Преміум</option>
          </select>
        </label>
        <label className="text-xs text-faint">
          Бренд
          <select
            className="mt-1 w-full rounded-xl border border-line bg-bg-0 px-3 py-2 text-sm text-text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">Усі бренди</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-faint sm:col-span-2 lg:col-span-1">
          Пошук
          <input
            className="mt-1 w-full rounded-xl border border-line bg-bg-0 px-3 py-2 text-sm outline-none ring-orange/40 focus:ring-2"
            placeholder="інвертор, OLED, для мами…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm text-muted">
          <input
            type="checkbox"
            checked={hitsOnly}
            onChange={(e) => setHitsOnly(e.target.checked)}
            className="size-4 accent-orange"
          />
          Лише хіти
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {sections
          .filter((s) => s.priority)
          .map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSectionId(s.id)}
              className={`rounded-full px-3 py-1 text-xs ${
                sectionId === s.id ? "bg-orange text-black" : "bg-bg-2 text-muted"
              }`}
            >
              {s.title}
            </button>
          ))}
        {sectionId && (
          <button
            type="button"
            onClick={() => setSectionId("")}
            className="rounded-full px-3 py-1 text-xs text-faint hover:text-text"
          >
            скинути секцію
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-faint">Знайдено: {list.length}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => {
          const section = getSection(p.sectionId);
          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group rounded-2xl panel p-4 transition hover:border-orange/40 hover:bg-bg-2"
            >
              <div className="flex items-start justify-between gap-2">
                <BandBadge band={p.bandId} />
                {p.isHit && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-green">
                    хіт
                  </span>
                )}
              </div>
              <div className="mt-3 font-semibold group-hover:text-orange-soft">{p.brand}</div>
              <div className="text-sm text-muted">{p.name}</div>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-faint">
                <span>{section?.title}</span>
                <span className="font-semibold text-text">
                  {p.price != null ? `${p.price.toLocaleString("uk-UA")} ₴` : "коридор"}
                </span>
              </div>
              <div className="mt-3 flex gap-2 text-[11px]">
                <span className="rounded-lg bg-bg-0 px-2 py-1 text-muted group-hover:text-orange-soft">
                  Відкрити картку
                </span>
                {p.relatedIds[0] && (
                  <span className="rounded-lg bg-bg-0 px-2 py-1 text-faint">
                    є з чим порівняти
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="mt-10 rounded-2xl panel p-8 text-center text-muted">
          Нічого не знайдено. Скинь фільтри або інший запит.
        </div>
      )}
    </div>
  );
}

export function CatalogClient() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Завантаження каталогу…</div>}>
      <CatalogInner />
    </Suspense>
  );
}
