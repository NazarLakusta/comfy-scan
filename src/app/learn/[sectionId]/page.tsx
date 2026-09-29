import { LearnClient } from "@/components/LearnClient";
import { sections } from "@/content";

export function generateStaticParams() {
  return sections.map((s) => ({ sectionId: s.id }));
}

export default async function LearnSectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return <LearnClient sectionId={sectionId} />;
}
