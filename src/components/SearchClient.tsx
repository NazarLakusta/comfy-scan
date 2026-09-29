"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchAll } from "@/content";
import { ButtonLink } from "@/components/ui";

export function SearchClient() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);

  const results = useMemo(() => searchAll(q), [q]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (q.trim()) url.searchParams.set("q", q.trim());
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Пошук</h1>
      <p className="mt-2 text-muted">
        Модель, бренд, тег сценарію: «для мами», «інвертор», «55», «фен».
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Що шукаємо?"
          className="flex-1 rounded-xl border border-line bg-bg-1 px-4 py-3 text-sm outline-none ring-orange/40 focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-xl bg-orange px-4 py-3 text-sm font-semibold text-black"
        >
          Знайти
        </button>
      </form>

      {!q.trim() && (
        <div className="mt-6 flex flex-wrap gap-2">
          {["для мами", "інвертор", "oled", "ноут", "фен", "робот"].map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => setQ(hint)}
              className="rounded-full bg-bg-2 px-3 py-1.5 text-xs text-muted hover:text-text"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      {q.trim() && (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="font-bold">Секції ({results.sections.length})</h2>
            <div className="mt-3 space-y-2">
              {results.sections.map((s) => (
                <Link
                  key={s.id}
                  href={`/sections/${s.id}`}
                  className="block rounded-xl panel px-4 py-3 hover:border-orange/40"
                >
                  {s.title}
                </Link>
              ))}
              {results.sections.length === 0 && (
                <p className="text-sm text-faint">Нічого</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-bold">Товари / хіти ({results.products.length})</h2>
            <div className="mt-3 space-y-2">
              {results.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="block rounded-xl panel px-4 py-3 hover:border-orange/40"
                >
                  <div className="font-semibold">
                    {p.brand} · {p.name}
                  </div>
                  <div className="text-xs text-muted">{p.forWhom}</div>
                </Link>
              ))}
              {results.products.length === 0 && (
                <p className="text-sm text-faint">Нічого</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-bold">Сценарії ({results.scenarios.length})</h2>
            <div className="mt-3 space-y-2">
              {results.scenarios.map((s) => (
                <Link
                  key={s.id}
                  href={`/scenarios#${s.id}`}
                  className="block rounded-xl panel px-4 py-3 hover:border-orange/40"
                >
                  «{s.clientPhrase}»
                </Link>
              ))}
              {results.scenarios.length === 0 && (
                <p className="text-sm text-faint">Нічого</p>
              )}
            </div>
          </section>
        </div>
      )}

      <div className="mt-10">
        <ButtonLink href="/" variant="ghost">
          ← На карту залу
        </ButtonLink>
      </div>
    </div>
  );
}
