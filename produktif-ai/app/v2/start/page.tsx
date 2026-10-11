import { fontVars } from "@/app/fonts";
import type { Metadata, Viewport } from "next";
import BusinessOnboarding from "@/components/onboarding/BusinessOnboarding";
import MotionRoot from "@/components/site/MotionRoot";
import "../../tokens.css";
import "../../start/onboarding.css";

// v2 Get Started for business owners. Kept out of search while v1 and v2 are compared.
export const metadata: Metadata = {
  title: "Get started | produktif.ai",
  description: "Apply for the produktif.ai founding cohort. About 2 minutes, nothing to pay.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "only light",
  interactiveWidget: "resizes-content",
};

export default function BusinessStartPage() {
  return (
    <div className={`pai ${fontVars}`}>
      <MotionRoot>
        <BusinessOnboarding />
      </MotionRoot>
    </div>
  );
}
