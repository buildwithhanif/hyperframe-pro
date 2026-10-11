"""The /v3 link-preview card (1200x630): the headline on black at left,
Hanif's AI version at right with a visible "Made with AI" tag.
    python3 scripts/og-v3.py        -> public/samples/v3/og.jpg
Needs Pillow and fontTools (for a static cut of the site's Archivo)."""
import os, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WOFF = os.path.join(APP, "app/fonts/archivo.woff2")
OUT = os.path.join(APP, "public/samples/v3/og.jpg")


def face(wght, wdth):
    path = tempfile.mktemp(suffix=".ttf")
    subprocess.run(["python3", "-m", "fontTools.varLib.instancer", "-q", WOFF, f"wght={wght}", f"wdth={wdth}", "-o", path], check=True)
    return path


display, body, tag = face(900, 62), face(500, 100), face(650, 100)
W, H = 1200, 630
card = Image.new("RGB", (W, H), "#000000")

# Right: the poster, scaled to the card's height, faded into the black at its left edge.
hero = Image.open(os.path.join(APP, "public/samples/v3/hero.jpg")).convert("RGB")
hero = hero.resize((round(hero.width * H / hero.height), H), Image.LANCZOS)
x0 = W - hero.width
card.paste(hero, (x0, 0))
fade = Image.new("L", (hero.width, H))
fd = ImageDraw.Draw(fade)
for i in range(180):
    fd.line([(i, 0), (i, H)], fill=round(255 * (1 - i / 180)))
card.paste(Image.new("RGB", (hero.width, H), "#000000"), (x0, 0), fade)

d = ImageDraw.Draw(card)
# The AI tag, top right on the face, fully visible.
f_tag = ImageFont.truetype(tag, 24)
label = "Made with AI · AI version of Hanif"
tw = d.textlength(label, font=f_tag)
bx, by = W - 32 - tw - 24, 32
d.rounded_rectangle([bx, by, bx + tw + 24, by + 44], radius=7, fill=(0, 0, 0))
d.text((bx + 12, by + 22), label, font=f_tag, fill="#ffffff", anchor="lm")

# Left: wordmark, headline, price line.
d.text((64, 56), "produktif.ai", font=ImageFont.truetype(face(850, 72), 40), fill="#ffffff")
f_h = ImageFont.truetype(display, 92)
y = 200
d.text((64, y), "60", font=f_h, fill="#ffd60a")
d.text((64 + d.textlength("60 ", font=f_h), y), "VIDEOS A MONTH.", font=f_h, fill="#ffffff")
d.text((64, y + 86), "YOU NEVER FILM", font=f_h, fill="#ffffff")
d.text((64, y + 172), "YOURSELF.", font=f_h, fill="#ffffff")
d.text((64, 520), "Rp 4,000,000 a month. Free to apply.", font=ImageFont.truetype(body, 30), fill="#d8d9db")
card.save(OUT, quality=86, optimize=True, progressive=True)
print(OUT, os.path.getsize(OUT) // 1024, "KB")
