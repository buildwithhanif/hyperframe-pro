#!/usr/bin/env python3
"""shots.py — real-screenshot pipeline for recognition beats (the footage rule / SPEC § 27b).

The four steps people usually do by hand, made mechanical so a
smaller model never guesses pixel rows:

  find  <article-url>                      list candidate screenshot URLs on a page (MakeUseOf, Android Police, Samsung support…)
  fetch <image-url> <out.jpg>              download at full size with a browser UA (MakeUseOf: append ?q=80&fit=contain&w=1080&h=2400)
  sheet <out.jpg> <img1> [img2 …]          contact sheet to LOOK at candidates before choosing (Read the jpg)
  grid  <img> <out.png> [y0 y1]            labelled 50 px grid over the image — the LABELS are source pixels
  rows  <img> [y0 y1]                      print copyable y-bands of every text/content row (use this, not the grid, for numbers)
  crop  <img> <out.png> x0 y0 x1 y1 [--paint x0,y0,x1,y1 …] [--sample x,y]
                                           crop + paint-out boxes with the sampled background colour (numbers that contradict the VO)
  check <out.png> <display-width> <line-height-px-in-source>
                                           prints the on-frame height of the beat's key line; must be ≥ 46

Rules baked in: never a watermarked press shot (reject on sight in `sheet`), never iOS chrome in an
Android video (crop the status/tab bars away), log every source in publish/sources.txt.
"""
import re, sys, json, urllib.request
from pathlib import Path

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"

def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def find(url):
    html = _get(url).decode("utf-8", "ignore")
    cands = set()
    for m in re.finditer(r'(?:data-img-url|src|data-src|content)="(https?://[^"?]+\.(?:png|jpg|jpeg|webp))', html):
        u = m.group(1)
        if re.search(r"logo|avatar|icon|favicon|gravatar|og-img|88x88|gnb|author|profilepic|placeholder|sprite", u, re.I):
            continue
        cands.add(u)
    hot = re.compile(r"screenshot|screen|settings|storage|menu|cache|trash|bin|notification|app-|showing|step", re.I)
    for u in sorted(cands, key=lambda u: (0 if hot.search(u) else 1, u)):   # likely UI screenshots first, stock photos last
        print(("* " if hot.search(u) else "  ") + u)
    if not cands:
        print("no candidates (bot wall or lazy-loaded) — try another source", file=sys.stderr)

def fetch(url, out):
    data = _get(url)
    Path(out).write_bytes(data)
    from PIL import Image
    im = Image.open(out)
    print(out, im.size)

def sheet(out, *imgs):
    from PIL import Image
    ims = [Image.open(f).convert("RGB") for f in imgs]
    h = 900
    th = [i.resize((max(1, int(i.width * h / i.height)), h)) for i in ims]
    s = Image.new("RGB", (sum(t.width for t in th) + 10 * len(th), h), "#333")
    x = 0
    for t in th:
        s.paste(t, (x, 0)); x += t.width + 10
    s.save(out, quality=85)
    print(out, s.size, "— READ it: reject any frame with a third-party NAME/handle/phone/album title (a mistake this cost us once), watermarks, wrong-OS chrome, low-res (< 1000 px wide) before cropping")

def grid(img, out, y0=None, y1=None, step=50):
    from PIL import Image, ImageDraw
    im = Image.open(img).convert("RGB")
    y0 = int(y0 or 0); y1 = int(y1 or im.height); step = int(step)   # argv gives strings
    im = im.crop((0, y0, im.width, y1)); dr = ImageDraw.Draw(im)
    for y in range(0, y1 - y0, step):
        dr.line((0, y, im.width, y), fill=(255, 0, 0) if (y + y0) % 100 == 0 else (120, 0, 0), width=1)
        dr.text((5, y + 2), str(y + y0), fill=(255, 255, 0))
    for x in range(0, im.width, 100):
        dr.line((x, 0, x, y1 - y0), fill=(0, 80, 160)); dr.text((x + 2, 20), str(x), fill=(0, 200, 255))
    im.save(out)
    print(out, "— labels are SOURCE pixels; the image you view is scaled to fit, so do NOT eyeball")
    print("     positions off it. Run `rows` for copyable numbers (a mistake this cost us once).")

def rows(img, y0=None, y1=None, thresh="40", minrun="12", polarity="auto"):
    """Print the y-bands of content rows as copyable numbers.

    Reading coordinates off a rendered grid image is how the storage v3 crops went wrong twice:
    the grid's labels are SOURCE pixels but the picture you look at is scaled to fit, so eyeballing
    a position silently applies that scale factor. This prints the numbers instead (a mistake this cost us once).

    `polarity` handles BOTH themes: dark UI (light text on dark bg — most Android/WhatsApp dark
    mode) counts pixels ABOVE thresh as content; light UI (dark text on white bg — most iOS
    Settings screens) counts pixels BELOW thresh. "auto" (default) samples the four corners and
    picks the polarity whose background they match — a light-mode screenshot with `thresh=40`
    used at the dark-mode default returns one giant band covering the whole image, which is the
    tell that this needs fixing, not a real result.
    """
    from PIL import Image
    im = Image.open(img).convert("L")
    y0 = int(y0 or 0); y1 = int(y1 or im.height); thresh = int(thresh); minrun = int(minrun)
    px = im.load(); W = im.width
    if polarity == "auto":
        corners = [px[2, 2], px[W - 3, 2], px[2, im.height - 3], px[W - 3, im.height - 3]]
        polarity = "dark" if (sum(corners) / 4) < 128 else "light"
    print(f"  (polarity: {polarity} — background sampled from corners)")
    step = max(1, W // 240)                      # sample columns, full scan is not needed
    lit = []
    for y in range(y0, y1):
        if polarity == "dark":
            n = sum(1 for x in range(0, W, step) if px[x, y] > thresh)
        else:
            n = sum(1 for x in range(0, W, step) if px[x, y] < 255 - thresh)
        lit.append(n > 1)
    bands, start = [], None
    for i, on in enumerate(lit):
        if on and start is None: start = i
        elif not on and start is not None:
            if i - start >= minrun: bands.append((y0 + start, y0 + i))
            start = None
    if start is not None and len(lit) - start >= minrun: bands.append((y0 + start, y1))
    print(f"{img}  {im.width}x{im.height}   rows in y {y0}-{y1} (threshold {thresh}):")
    for a, b in bands:
        # x-extent of the band, so a callout box can hug the actual content
        xs = [x for x in range(0, W, step) for yy in range(a, min(b, a + 40)) if px[x, yy] > thresh]
        x_lo, x_hi = (min(xs), max(xs)) if xs else (0, W)
        print(f"  y {a:5d}-{b:5d}  (h {b-a:4d})   x {x_lo:4d}-{x_hi:4d}    crop/box args: {x_lo} {a} {x_hi - x_lo} {b - a}")
    if not bands: print("  (no bands — raise y range or lower the threshold)")

def crop(img, out, x0, y0, x1, y1, *rest):
    from PIL import Image, ImageDraw
    im = Image.open(img).convert("RGB")
    paints, sample = [], None
    it = iter(rest)
    for a in it:
        if a == "--paint": paints.append(tuple(int(v) for v in next(it).split(",")))
        elif a == "--sample": sample = tuple(int(v) for v in next(it).split(","))
    dr = ImageDraw.Draw(im)
    for b in paints:
        c = im.getpixel(sample) if sample else im.getpixel((min(im.width - 1, b[2] + 40), (b[1] + b[3]) // 2))
        dr.rectangle(b, fill=c)
    c = im.crop((int(x0), int(y0), int(x1), int(y1)))
    c.save(out)
    print(out, c.size, f"paint-outs={len(paints)}")

def check(out, display_w, line_h):
    from PIL import Image
    im = Image.open(out)
    scale = float(display_w) / im.width
    on_frame = float(line_h) * scale
    verdict = "OK" if on_frame >= 46 else "TOO SMALL — crop tighter or widen the card"
    print(f"{out}: {im.width}×{im.height} shown at {display_w}px → scale {scale:.3f}; key line {line_h}px → {on_frame:.0f}px on frame: {verdict}")

if __name__ == "__main__":
    cmd, *args = sys.argv[1:] or ["help"]
    fn = {"find": find, "fetch": fetch, "sheet": sheet, "grid": grid, "rows": rows, "crop": crop, "check": check}.get(cmd)
    if not fn:
        print(__doc__); sys.exit(1)
    fn(*args)
