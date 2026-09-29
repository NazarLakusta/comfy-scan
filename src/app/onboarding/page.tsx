"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPrioritySections } from "@/content";
import { updateProgress } from "@/lib/progress";
import { ButtonLink } from "@/components/ui";

const slides = [
  {
    title: "Спочатку карта залу",
    body: "Увесь магазин розбитий на секції: від ноутів і ТВ до пралок, кондиціонерів і фенів.",
  },
  {
    title: "Три полиці в кожній секції",
    body: "Бюджет / середній / преміум. У кожній — хіти, які варто знати напам’ять.",
  },
  {
    title: "Тренажер по черзі",
    body: "Читай терміни, порівнюй моделі, відповідай на «клиент сказав» і закріплюй квізом.",
  },
];

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const router = useRouter();
  const first = getPrioritySections()[0];

  function finish() {
    updateProgress((prev) => ({ ...prev, onboardingDone: true, lastSectionId: first?.id }));
    router.push(first ? `/train/${first.id}` : "/");
  }

  const slide = slides[i];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-3xl panel p-8">
        <p className="text-sm font-semibold text-green">
          {i + 1} / {slides.length}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{slide.title}</h1>
        <p className="mt-3 text-muted leading-relaxed">{slide.body}</p>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-sm text-muted hover:text-text disabled:opacity-30"
            disabled={i === 0}
            onClick={() => setI((x) => Math.max(0, x - 1))}
          >
            Назад
          </button>
          {i < slides.length - 1 ? (
            <button
              type="button"
              className="rounded-xl bg-orange px-4 py-2.5 text-sm font-semibold text-black"
              onClick={() => setI((x) => x + 1)}
            >
              Далі
            </button>
          ) : (
            <button
              type="button"
              className="rounded-xl bg-orange px-4 py-2.5 text-sm font-semibold text-black"
              onClick={finish}
            >
              Почати з {first?.title ?? "карти"}
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 text-center">
        <ButtonLink href="/" variant="ghost">
          Пропустити
        </ButtonLink>
      </div>
    </div>
  );
}
