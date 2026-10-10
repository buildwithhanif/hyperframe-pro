import localFont from "next/font/local";

// One family for the whole site: Archivo, variable in weight (400 to 900) and
// width (62 to 100), subset to Latin (56 KB). Condensed heavy cuts set the
// headlines, the normal width sets the text. See DESIGN.md.
export const archivo = localFont({
  src: "./fonts/archivo.woff2",
  weight: "400 900",
  style: "normal",
  display: "swap",
  variable: "--font-archivo",
  adjustFontFallback: "Arial",
  declarations: [{ prop: "font-stretch", value: "62% 100%" }],
});

// Every marketing page root gets the font variable.
export const fontVars = archivo.variable;
