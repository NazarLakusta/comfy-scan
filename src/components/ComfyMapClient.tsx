"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { comfyCatalogMeta, comfyCategories } from "@/content/comfy-categories";
import { ButtonLink } from "@/components/ui";

export function ComfyMapClient() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<number | "all">("all");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return comfyCategories.filter((c) => {
      if (level !== "all" && c.level !== level) return false;
      if (!query) return true;
      return (
        c.name.toLowerCase().includes(query) ||
        c.urlKey.toLowerCase().includes(query) ||
        c.path.toLowerCase().includes(query)
      );
    });
  }, [q, level]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold text-green">Офіційна карта категорій Comfy</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Усі розділи сайту Comfy
      </h1>
      <p className="mt-3 max-w-3xl text-muted">
        Підвантажено з публічного API категорій Comfy: {comfyCatalogMeta.totalUseful} активних
        (із {comfyCatalogMeta.totalRaw} у сирому дереві). Це карта залу/сайту для орієнтації.
        Повні SKU підтягуй локально через <code className="text-orange-soft">npm run parse:comfy</code>.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Пошук: монітори, пралки, фени…"
          className="min-w-[240px] flex-1 rounded-xl border border-line bg-bg-1 px-4 py-3 text-sm outline-none ring-orange/40 focus:ring-2"
        />
        <select
          value={level === "all" ? "all" : String(level)}
          onChange={(e) =>
            setLevel(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="rounded-xl border border-line bg-bg-1 px-3 py-3 text-sm"
        >
          <option value="all">Усі рівні</option>
          <option value="2">Рівень 2</option>
          <option value="3">Рівень 3</option>
          <option value="4">Рівень 4</option>
          <option value="5">Рівень 5</option>
        </select>
        <ButtonLink href="/catalog" variant="soft">
          Наш навчальний каталог
        </ButtonLink>
      </div>

      <p className="mt-4 text-sm text-faint">Показано: {list.length}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, 300).map((c) => (
          <a
            key={c.id}
            href={`https://comfy.ua/ua/${c.path}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl panel px-4 py-3 transition hover:border-orange/40"
          >
            <div className="font-semibold hover:text-orange-soft">{c.name}</div>
            <div className="mt-1 text-[11px] text-faint">
              lvl {c.level} · {c.urlKey}
            </div>
          </a>
        ))}
      </div>

      {list.length > 300 && (
        <p className="mt-4 text-sm text-muted">
          Показані перші 300. Уточни пошук, щоб звузити.
        </p>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-muted hover:text-orange-soft">
          ← На карту навчання
        </Link>
      </div>
    </div>
  );
}
