import Link from "next/link";
import { getProduct, scenarios, getSection } from "@/content";
import { ButtonLink } from "@/components/ui";

export default function ScenariosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Клиент сказав…</h1>
      <p className="mt-2 text-muted">
        Типові фрази з залу. Відкрий — побачиш полицю, 2–3 варіанти й підказку консультанта.
      </p>

      <div className="mt-8 space-y-4">
        {scenarios.map((s) => {
          const section = getSection(s.sectionId);
          return (
            <article
              key={s.id}
              id={s.id}
              className="scroll-mt-24 rounded-2xl panel p-5"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-green">
                {section?.title ?? s.sectionId}
              </div>
              <h2 className="mt-2 text-xl font-bold">«{s.clientPhrase}»</h2>
              <p className="mt-2 text-sm text-orange-soft">{s.budgetHint}</p>
              <p className="mt-3 text-sm text-muted">{s.coachTip}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.recommendedProductIds.map((id) => {
                  const p = getProduct(id);
                  if (!p) return null;
                  return (
                    <Link
                      key={id}
                      href={`/products/${id}`}
                      className="rounded-xl bg-bg-2 px-3 py-2 text-sm hover:text-orange-soft"
                    >
                      {p.brand} · {p.name}
                    </Link>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8">
        <ButtonLink href="/" variant="ghost">
          ← На карту залу
        </ButtonLink>
      </div>
    </div>
  );
}
