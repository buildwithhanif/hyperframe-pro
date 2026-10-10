import type { Metadata } from "next";
import "./base.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://produktif.ai"),
  title: "produktif.ai · Let AI work. Go live your life.",
  description:
    "Done-for-you AI content. We turn your face and voice into an AI persona and deliver two ready-to-post talking-head videos a day. Join the waitlist for the first cohort.",
  openGraph: {
    title: "produktif.ai",
    description: "Two ready-to-post talking-head videos a day. You record once. We handle the rest.",
    url: "https://produktif.ai",
    siteName: "produktif.ai",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
