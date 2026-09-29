"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getProduct,
  getProductsBySection,
  getSection,
  products,
  sections,
  type Product,
} from "@/content";
import { BandBadge, ButtonLink } from "@/components/ui";

function CompareTable({ items, sectionId }: { items: Product[]; sectionId?: string }) {
  const section = sectionId ? getSection(sectionId) : getSection(items[0]?.sectionId ?? "");
  const keys =
    section?.compareKeys ??
    Object.keys(items[0]?.specs ?? {}).map((key) => ({ key, label: key }));

  return (
    <div className="overflow-x-auto rounded-2xl panel">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-3 text-faint font-medium">Параметр</th>
            {items.map((p) => (
              <th key={p.id} className="px-4 py-3">
                <div className="font-semibold">{p.brand}</div>
                <div className="text-xs text-muted">{p.name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-line/70">
            <td className="px-4 py-3 text-faint">Полиця</td>
            {items.map((p) => (
              <td key={p.id} className="px-4 py-3">
                <BandBadge band={p.bandId} />
              </td>
            ))}
          </tr>
          {keys.map((k) => (
            <tr key={k.key} className="border-b border-line/70 align-top">
              <td className="px-4 py-3 text-faint">{k.label}</td>
              {items.map((p) => (
                <td key={p.id} className="px-4 py-3">
                  {p.specs[k.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
          <tr className="align-top">
            <td className="px-4 py-3 text-faint">Кому</td>
            {items.map((p) => (
              <td key={p.id} className="px-4 py-3 text-muted">
                {p.forWhom}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function CompareClient() {
  const params = useSearchParams();
  const initialIds = (params.get("ids") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const sectionFilter = params.get("section") ?? "";

  const pool = useMemo(() => {
    if (sectionFilter) return getProductsBySection(sectionFilter);
    return products;
  }, [sectionFilter]);

  const [selected, setSelected] = useState<string[]>(
    initialIds.length ? initialIds.slice(0, 3) : pool.slice(0, 2).map((p) => p.id),
  );

  const items = selected.map((id) => getProduct(id)).filter(Boolean) as Product[];

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Порівняння</h1>
      <p className="mt-2 text-muted">
        Обери 2–3 моделі. У таблиці лише головні ключі секції.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/compare"
          className={`rounded-full px-3 py-1.5 text-xs ${!sectionFilter ? "bg-orange text-black" : "bg-bg-2 text-muted"}`}
        >
          Усі
        </Link>
        {sections
          .filter((s) => getProductsBySection(s.id).length > 1)
          .map((s) => (
            <Link
              key={s.id}
              href={`/compare?section=${s.id}`}
              className={`rounded-full px-3 py-1.5 text-xs ${sectionFilter === s.id ? "bg-orange text-black" : "bg-bg-2 text-muted"}`}
            >
              {s.title}
            </Link>
          ))}
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {pool.map((p) => {
          const active = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                active
                  ? "border-orange bg-orange/10"
                  : "border-line bg-bg-1 hover:bg-bg-2"
              }`}
            >
              <div className="text-sm font-semibold">
                {p.brand} · {p.name}
              </div>
              <div className="mt-1 text-xs text-muted">{p.forWhom}</div>
            </button>
          );
        })}
      </div>

      {items.length >= 2 ? (
        <div className="mt-8 space-y-4">
          <CompareTable items={items} sectionId={items[0].sectionId} />
          <div className="rounded-2xl panel p-5">
            <h2 className="font-bold text-green">Що сказати вголос</h2>
            <div className="mt-3 space-y-3">
              {items.map((p) => (
                <p key={p.id} className="text-sm text-muted">
                  <span className="font-semibold text-text">{p.brand}: </span>
                  {p.pitch}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-8 text-sm text-faint">Обери щонайменше 2 моделі.</p>
      )}

      <div className="mt-8">
        <ButtonLink href="/" variant="ghost">
          ← На карту залу
        </ButtonLink>
      </div>
    </div>
  );
}
