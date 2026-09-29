import { Suspense } from "react";
import { SearchClient } from "@/components/SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Завантаження…</div>}>
      <SearchClient />
    </Suspense>
  );
}
