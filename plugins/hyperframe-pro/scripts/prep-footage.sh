#!/bin/bash
# prep-footage.sh — turn a generated clip into a composition-ready plate.
#
#   prep-footage.sh <in.mp4> <out.mp4> <trimStart> <duration>
#
# The video model returns odd sizes (1080x1906) at 24 fps with an audio track; the composition wants
# exactly 1080x1920 at 30 fps, silent. Since 15 Sep 2026 plates are generated at 768P to halve the cost
# (a mistake this cost us once), so this also UPSCALES — a light unsharp pass keeps the grain reading as grain instead of
# mush. Everything here is the part that is easy to get wrong by hand.
#
# trimStart matters more than anything else in this script: trim so the ACTION lands on its cue word.
# Find the frame where the action completes, then subtract the cue time from it.
set -euo pipefail
IN="${1:?usage: prep-footage.sh <in.mp4> <out.mp4> <trimStart> <duration>}"
OUT="${2:?missing out.mp4}"
SS="${3:?missing trimStart (seconds)}"
DUR="${4:?missing duration (seconds)}"

SRC_W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width  -of csv=p=0 "$IN")
SRC_H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$IN")
SRC_D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")

# refuse silently-wrong output rather than producing a plate that runs out of frames mid-beat
END=$(python3 -c "print(round($SS + $DUR, 3))")
if python3 -c "import sys; sys.exit(0 if $END <= $SRC_D + 0.001 else 1)"; then :; else
  echo "prep-footage: trim $SS + $DUR = ${END}s exceeds the source ($SRC_D s)." >&2
  echo "  Generate a longer clip or shorten the beat — do NOT let a plate run out mid-beat." >&2
  exit 1
fi

SHARP=""
if python3 -c "import sys; sys.exit(0 if $SRC_W < 1080 else 1)"; then
  SHARP=",unsharp=5:5:0.45:5:5:0.0"          # gentle: upscaled grain, not edge halos
  echo "prep-footage: source is ${SRC_W}x${SRC_H} — upscaling to 1080x1920 with a light sharpen"
else
  echo "prep-footage: source is ${SRC_W}x${SRC_H} — no upscale needed"
fi

mkdir -p "$(dirname "$OUT")"
ffmpeg -loglevel error -y -ss "$SS" -i "$IN" -t "$DUR" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30${SHARP}" \
  -an -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUT"

echo "prep-footage: $OUT  $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$OUT")  $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s"
echo "  next: <video class=\"clip footage\" muted playsinline preload=\"auto\" data-start data-duration>"
echo "        no GSAP autoAlpha on it, no opacity:0 in its CSS (a mistake this cost us once), and log it in publish/sources.txt"
