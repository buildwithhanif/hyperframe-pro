import type { Metadata } from "next";
import "./base.css";
import UtmKeeper from "@/components/site/UtmKeeper";

export const metadata: Metadata = {
  metadataBase: new URL("https://produktif.ai"),
  title: "produktif.ai | 60 short videos a month, done for you",
  description:
    "Done-for-you short videos for creators. Send 3 photos and a 2-minute voice read once, and get 60 videos a month with your AI persona, labeled as AI. Founding rate Rp 4,000,000 a month.",
  applicationName: "produktif.ai",
  openGraph: {
    title: "Post every day. We make the videos.",
    description: "60 short videos a month with your AI persona, made from your recording. Apply for the first cohort.",
    url: "https://produktif.ai",
    siteName: "produktif.ai",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Post every day. We make the videos.",
    description: "60 short videos a month with your AI persona, made from your recording. Apply for the first cohort.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UtmKeeper />
        {children}
      </body>
    </html>
  );
}
