import { ExamClient } from "@/components/ExamClient";
import { sections } from "@/content";

export function generateStaticParams() {
  return sections.map((s) => ({ sectionId: s.id }));
}

export default async function ExamSectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return <ExamClient sectionId={sectionId} />;
}
