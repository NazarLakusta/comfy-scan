import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={cn("border-b border-line/80 bg-bg-0/70 backdrop-blur-md", className)}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange text-sm font-extrabold text-black">
            CF
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight group-hover:text-orange-soft">
              Comfy Floor Map
            </div>
            <div className="text-[11px] text-muted">тренажер консультанта</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link className="rounded-lg px-3 py-2 text-muted hover:bg-bg-2 hover:text-text" href="/scenarios">
            Клиент сказав
          </Link>
          <Link className="rounded-lg px-3 py-2 text-muted hover:bg-bg-2 hover:text-text" href="/compare">
            Порівняти
          </Link>
          <Link className="rounded-lg px-3 py-2 text-muted hover:bg-bg-2 hover:text-text" href="/search">
            Пошук
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "soft";
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-orange text-black hover:bg-orange-soft"
      : variant === "soft"
        ? "bg-bg-2 text-text hover:bg-line"
        : "text-muted hover:text-text hover:bg-bg-2";
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition",
        styles,
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function BandBadge({ band }: { band: "budget" | "mid" | "premium" }) {
  const label = band === "budget" ? "Бюджет" : band === "mid" ? "Середній" : "Преміум";
  const cls =
    band === "budget" ? "band-budget bg-budget/10" : band === "mid" ? "band-mid bg-mid/10" : "band-premium bg-premium/10";
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", cls)}>
      {label}
    </span>
  );
}

export function ProgressRail({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-bg-2">
      <div
        className="h-full rounded-full bg-gradient-to-r from-green-dim to-green transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
