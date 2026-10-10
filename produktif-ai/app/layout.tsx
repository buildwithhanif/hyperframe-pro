import type { Metadata, Viewport } from "next";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://produktif.ai"),
  title: "produktif.ai: topik jadi carousel",
  description:
    "Masukin topik, keluar carousel Instagram yang siap posting. Formatnya dari 220 carousel @hanifmuh_ yang tembus 106,7 juta views.",
  openGraph: {
    title: "produktif.ai",
    description: "Topik jadi carousel yang orang save dan kirim ke temennya.",
    url: "https://produktif.ai",
    siteName: "produktif.ai",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1117",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
