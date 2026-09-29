import Link from "next/link";
import { notFound } from "next/navigation";
import {
  departments,
  getDepartment,
  getProductsBySection,
  getSectionsByDepartment,
  getTrainerSteps,
} from "@/content";
import { ButtonLink, ProgressRail } from "@/components/ui";

export function generateStaticParams() {
  return departments.map((d) => ({ id: d.id }));
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dep = getDepartment(id);
  if (!dep) notFound();
  const depSections = getSectionsByDepartment(id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm text-muted hover:text-orange-soft">
        ← Карта залу
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {dep.title}
      </h1>
      <p className="mt-2 text-muted">{dep.blurb}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {depSections.map((section) => {
          const count = getProductsBySection(section.id).length;
          const steps = getTrainerSteps(section.id).length;
          return (
            <div key={section.id} className="rounded-2xl panel p-4">
              <Link href={`/sections/${section.id}`} className="block">
                <div className="font-semibold hover:text-orange-soft">{section.title}</div>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{section.summary}</p>
                <p className="mt-3 text-xs text-faint">
                  {count} товарів · {steps} кроків тренажера
                </p>
                <div className="mt-2">
                  <ProgressRail value={0} />
                </div>
              </Link>
              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink href={`/sections/${section.id}`} variant="soft" className="!py-2 !text-xs">
                  Секція
                </ButtonLink>
                <ButtonLink href={`/train/${section.id}`} className="!py-2 !text-xs">
                  Вчити
                </ButtonLink>
                <ButtonLink
                  href={`/catalog?section=${section.id}`}
                  variant="ghost"
                  className="!py-2 !text-xs"
                >
                  Каталог
                </ButtonLink>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
