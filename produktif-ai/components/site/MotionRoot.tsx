"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

// Loads only the animation features the site uses, and follows the visitor's
// reduced-motion setting everywhere Motion animates.
export default function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
