#!/bin/bash
# Cuts the homepage samples from Hanif's AI persona Reels.
# Input: a folder of source MP4s (the samples-raw branch, made by the
# fetch-samples workflow). Output: public/samples/ in this app.
#   ./scripts/cut-samples.sh /path/to/samples-raw
set -euo pipefail
SRC=${1:?source folder}
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/samples"
mkdir -p "$OUT/frames"

# name  start  length  poster-at   (each loop opens on the persona hook; the
# poster is a topic-specific moment, since every Reel opens on the same STOP)
CLIPS="qris 0 10.5 4.75
damai 0 10 5.6
colokan 0 10 5.2
ahliwaris 0 9.5 4.6
bpjs 0 12 5.2
dana 0 12 11.4
xiaomi 0 10 4.6"

echo "$CLIPS" | while read -r name start len poster; do
  ffmpeg -nostdin -loglevel error -y -ss "$start" -t "$len" -i "$SRC/$name.mp4" \
    -vf "scale=720:-2,fps=30" -c:v libx264 -preset slow -crf 27 -maxrate 1300k -bufsize 2600k \
    -pix_fmt yuv420p -profile:v high -c:a aac -b:a 96k -ac 2 -movflags +faststart "$OUT/$name.mp4"
  ffmpeg -nostdin -loglevel error -y -ss "$poster" -i "$SRC/$name.mp4" -frames:v 1 -vf "scale=540:-2" -q:v 4 "$OUT/$name.jpg"
  printf '%-10s %6s KB video  %4s KB poster\n' "$name" "$(( $(stat -c%s "$OUT/$name.mp4") / 1024 ))" "$(( $(stat -c%s "$OUT/$name.jpg") / 1024 ))"
done

# 60 stills for the month wall, spread across all seven Reels.
i=1
for name in damai qris bpjs colokan ahliwaris dana xiaomi; do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC/$name.mp4")
  for k in 0 1 2 3 4 5 6 7 8; do
    [ $i -gt 60 ] && break
    t=$(python3 -c "print(round(($k + 0.5) * $d / 9, 2))")
    ffmpeg -nostdin -loglevel error -y -ss "$t" -i "$SRC/$name.mp4" -frames:v 1 -vf "scale=108:192" -q:v 6 "$OUT/frames/f$(printf %02d $i).jpg"
    i=$((i + 1))
  done
done
du -sh "$OUT/frames" "$OUT"
