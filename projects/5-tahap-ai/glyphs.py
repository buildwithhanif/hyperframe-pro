#!/usr/bin/env python3
"""glyphs.py: Bricolage Grotesque 800 outlines as SVG path data -> assets/glyphs.json

    python3 glyphs.py .      (needs fonttools + brotli; run once, the JSON is committed)

Giant display type (the hook's 5, the stage wipes, the background words) is drawn as PATHS, not text.
A text box at 300-500 px reaches ~100 px past its ink, and every layout check then reads the lines around
it as overlapping. build.mjs lays the glyphs out itself with their advance widths.
"""
import json, os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
proj = sys.argv[1] if len(sys.argv) > 1 else "."
f = TTFont(os.path.join(proj, "assets/fonts/bricolage-grotesque-latin-800-normal.woff2"))
gs, cmap, hmtx = f.getGlyphSet(), f.getBestCmap(), f["hmtx"]
out = {"upm": f["head"].unitsPerEm, "cap": 660, "g": {}}
for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.-/ ":
    n = cmap.get(ord(ch))
    if n is None: continue
    pen = SVGPathPen(gs); gs[n].draw(pen)
    out["g"][ch] = {"d": pen.getCommands(), "adv": hmtx[n][0]}
json.dump(out, open(os.path.join(proj, "assets/glyphs.json"), "w"))
print(len(out["g"]), "glyphs")
