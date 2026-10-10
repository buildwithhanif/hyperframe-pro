import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// Newsreader with its optical-size axis: at display sizes the browser picks the
// tight opsz 72 cut. The weight-only file looks wide and blunt up there.
export const newsreader = localFont({
  src: "./fonts/newsreader.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-newsreader",
  adjustFontFallback: "Times New Roman",
});

// Every marketing page root gets all three font variables.
export const fontVars = `${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable}`;
