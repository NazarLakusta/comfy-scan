import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SiteHeader } from "@/components/ui";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Comfy Floor Map — тренажер консультанта",
  description:
    "Карта залу Comfy: секції, цінові полиці, хіти, порівняння характеристик і тренажер для менеджера-консультанта.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={`${manrope.variable} h-full antialiased`}>
      <body className="atmosphere min-h-full flex flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
