import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Onboarding from "@/components/onboarding/Onboarding";
import "../tokens.css";
import "./onboarding.css";

export const metadata: Metadata = {
  title: "Get started · produktif.ai",
  description: "Apply for the first produktif.ai cohort. Takes about 2 minutes, nothing to pay.",
  alternates: { canonical: "/start" },
};

export const viewport: Viewport = {
  themeColor: "#F5F2EB",
  colorScheme: "light",
};

export default function StartPage() {
  return (
    <div className={`pai ${GeistSans.variable} ${GeistMono.variable}`}>
      <Onboarding />
    </div>
  );
}
