import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceBand(from: number, to?: number) {
  if (to == null) return `від ${from.toLocaleString("uk-UA")} ₴`;
  return `${from.toLocaleString("uk-UA")}–${to.toLocaleString("uk-UA")} ₴`;
}
