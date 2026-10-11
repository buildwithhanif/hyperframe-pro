#!/bin/bash
# Cuts the v3 hero loop and the two anatomy stills from Hanif's AI-version Reels.
#   ./scripts/cut-v3.sh /tmp/claude-0/samples-raw     (preferred: higher bitrate)
#   ./scripts/cut-v3.sh                               (falls back to public/samples)
# cut-samples.sh starts every sample at 0, so the timecodes match either way.
# Output: public/samples/v3/{hero.mp4, hero.jpg, open.jpg, close.jpg}
set -euo pipefail
APP=${APP:-"$(cd "$(dirname "$0")/.." && pwd)"}
SRC=${1:-$APP/public/samples}
[ -f "$SRC/ahliwaris.mp4" ] || SRC="$APP/public/samples"
OUT=${2:-$APP/public/samples/v3}
mkdir -p "$OUT"

# Archivo as a static TTF for the burned-in label (drawtext can't read woff2).
FONT=$(mktemp --suffix=.ttf)
python3 -m fontTools.varLib.instancer -q "$APP/app/fonts/archivo.woff2" wght=750 wdth=100 -o "$FONT" ||
  cp /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf "$FONT"

# Hero: 4 face-only windows from the same lamp-lit room, top 820 px of the
# frame (the burned captions sit below y=870, big keywords appear after each
# window ends). Frame 0 = ahliwaris 2.43 s, mouth closed: it is the poster.
#   1 ahliwaris 2.43-3.60  ("2X PESANGON" lands at 3.67)
#   2 damai     3.17-5.00  (accident scene before 3.1, envelope man at 5.07)
#   3 qris      7.13-8.03  (news masthead before 7.1, "Rp0" at 8.10)
#   4 ahliwaris 1.90-2.43  (funeral/envelope scene before 1.85; runs into 1)
# "Made with AI" is burned bottom-left (y 780-812), on the shirt, so saved or
# re-posted copies stay labelled. On the page that strip sits under the fades.
ffmpeg -nostdin -loglevel error -y \
  -ss 2.43 -t 1.17 -i "$SRC/ahliwaris.mp4" \
  -ss 3.17 -t 1.83 -i "$SRC/damai.mp4" \
  -ss 7.13 -t 0.90 -i "$SRC/qris.mp4" \
  -ss 1.90 -t 0.53 -i "$SRC/ahliwaris.mp4" \
  -filter_complex "\
[0:v]fps=30,crop=720:820:0:0,setsar=1[a];\
[1:v]fps=30,crop=720:820:0:0,setsar=1[b];\
[2:v]fps=30,crop=720:820:0:0,setsar=1[c];\
[3:v]fps=30,crop=720:820:0:0,setsar=1[d];\
[a][b][c][d]concat=n=4:v=1:a=0,\
drawbox=x=20:y=780:w=150:h=32:color=black@0.8:t=fill,\
drawtext=fontfile=$FONT:text='Made with AI':fontsize=19:fontcolor=white:x=20+(150-tw)/2:y=780+(32-th)/2[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 22 -profile:v high -pix_fmt yuv420p -g 60 -movflags +faststart "$OUT/hero.mp4"
ffmpeg -nostdin -loglevel error -y -i "$OUT/hero.mp4" -frames:v 1 -q:v 3 "$OUT/hero.jpg"

# Anatomy stills: 9:16 crops from the caption-free top of the frame.
ffmpeg -nostdin -loglevel error -y -ss 3.50 -i "$SRC/ahliwaris.mp4" -frames:v 1 -vf "crop=460:818:130:0,scale=360:640:flags=lanczos" -q:v 4 "$OUT/open.jpg"
ffmpeg -nostdin -loglevel error -y -ss 7.40 -i "$SRC/qris.mp4" -frames:v 1 -vf "crop=460:818:130:0,scale=360:640:flags=lanczos" -q:v 4 "$OUT/close.jpg"
rm -f "$FONT"

for f in hero.mp4 hero.jpg open.jpg close.jpg; do printf '%-10s %5s KB\n' "$f" "$(( $(stat -c%s "$OUT/$f") / 1024 ))"; done
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,nb_frames,r_frame_rate -of csv=p=0 "$OUT/hero.mp4"
[ -z "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$OUT/hero.mp4")" ] && echo "no audio track: ok"
