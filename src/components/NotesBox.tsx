"use client";

import { useEffect, useState } from "react";
import { loadProgress, updateProgress } from "@/lib/progress";

export function NotesBox({
  noteKey,
  label = "Нотатка",
}: {
  noteKey: string;
  label?: string;
}) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    setValue(p.notes[noteKey] ?? "");
  }, [noteKey]);

  return (
    <div className="rounded-2xl panel p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">{label}</h2>
        {saved && <span className="text-xs text-green">збережено</span>}
      </div>
      <textarea
        className="mt-3 min-h-28 w-full resize-y rounded-xl border border-line bg-bg-0 px-3 py-2 text-sm outline-none ring-orange/40 placeholder:text-faint focus:ring-2"
        placeholder="Своїми словами: як пояснюєш клієнту…"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        onBlur={() => {
          updateProgress((prev) => ({
            ...prev,
            notes: { ...prev.notes, [noteKey]: value },
          }));
          setSaved(true);
        }}
      />
    </div>
  );
}
