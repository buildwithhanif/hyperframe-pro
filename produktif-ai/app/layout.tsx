import type { Metadata } from "next";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://produktif.ai"),
  title: "produktif.ai: skill dan workflow AI dari akun yang beneran jalan",
  description:
    "Skill dan workflow yang dipakai Hanif Produktif buat ngejalanin akun-akunnya, dibungkus jadi file yang tinggal dipasang di ChatGPT atau Claude. Gabung waitlist drop pertama.",
  openGraph: {
    title: "produktif.ai",
    description: "Lo udah bayar AI-nya. Yang belum ada: cara kerjanya. Gabung waitlist drop pertama.",
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
