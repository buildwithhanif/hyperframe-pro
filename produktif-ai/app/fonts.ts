import localFont from "next/font/local";

// All three faces are self-hosted and subset to Latin (see app/fonts/OFL.txt).

// Newsreader with its optical-size axis, subset to weights 400 to 600 and
// optical sizes 18 to 72 (64 KB). At display sizes the browser picks the tight
// opsz 72 cut. The weight-only file looks wide and blunt up there.
export const newsreader = localFont({
  src: "./fonts/newsreader.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-newsreader",
  adjustFontFallback: "Times New Roman",
});

// Geist, weights 400 to 800 (26 KB). Body, UI and the captions inside frames.
export const geistSans = localFont({
  src: "./fonts/geist.woff2",
  weight: "400 800",
  display: "swap",
  variable: "--font-geist-sans",
  adjustFontFallback: "Arial",
});

// Geist Mono only prints small machine data (timecodes, counts), so it isn't
// preloaded and never competes with the headline for bandwidth.
export const geistMono = localFont({
  src: "./fonts/geist-mono.woff2",
  weight: "400 800",
  display: "swap",
  preload: false,
  variable: "--font-geist-mono",
  adjustFontFallback: false,
});

// Every marketing page root gets all three font variables.
export const fontVars = `${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`;
