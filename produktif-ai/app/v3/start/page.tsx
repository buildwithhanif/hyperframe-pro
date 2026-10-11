import { fontVars } from "@/app/fonts";
import type { Metadata, Viewport } from "next";
import BusinessOnboarding from "@/components/onboarding/BusinessOnboarding";
import MotionRoot from "@/components/site/MotionRoot";
import "../../tokens.css";
import "../../start/onboarding.css";

// v3 Get Started: the same six questions as v2, returning to /v3.
export const metadata: Metadata = {
  title: "Get started | produktif.ai",
  description: "Apply for the produktif.ai founding cohort. About 2 minutes, nothing to pay.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", colorScheme: "only light", interactiveWidget: "resizes-content" };

export default function V3StartPage() {
  return (
    <div className={`pai ${fontVars}`}>
      <MotionRoot>
        <BusinessOnboarding home="/v3" />
      </MotionRoot>
    </div>
  );
}
