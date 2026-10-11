import { fontVars } from "@/app/fonts";
import type { Metadata, Viewport } from "next";
import Onboarding from "@/components/onboarding/Onboarding";
import MotionRoot from "@/components/site/MotionRoot";
import "../tokens.css";
import "./onboarding.css";

export const metadata: Metadata = {
  title: "Get started | produktif.ai",
  description: "Apply for the first produktif.ai cohort. Takes about 2 minutes, nothing to pay.",
  alternates: { canonical: "/start" },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "only light",
  interactiveWidget: "resizes-content",
};

export default function StartPage() {
  return (
    <div className={`pai ${fontVars}`}>
      <MotionRoot>
        <Onboarding />
      </MotionRoot>
    </div>
  );
}
