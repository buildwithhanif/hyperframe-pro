import type { Metadata } from "next";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://produktif.ai"),
  title: "produktif.ai: 2 video talking head tiap hari, tanpa rekaman",
  description:
    "Done for you dari Hanif Produktif: persona AI dari wajah dan suara lo, 60 video Reels sebulan, Rp 4 juta per bulan. Daftar waitlist batch pertama.",
  openGraph: {
    title: "produktif.ai",
    description: "2 video talking head tiap hari. Lo ga perlu rekaman. Daftar waitlist batch pertama.",
    url: "https://produktif.ai",
    siteName: "produktif.ai",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
