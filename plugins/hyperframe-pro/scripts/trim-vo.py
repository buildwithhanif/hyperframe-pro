"""trim-vo.py — bring a finished take under the 2:59 ceiling WITHOUT new TTS (SKILL rule 2).

    python3 trim-vo.py <projectDir> [capDefault=0.24] [capBeforeStep=0.42]

Caps every inter-word pause, splicing the existing recording sample-exactly and re-timing the word
table from the ACTUAL frames removed, so captions and every animation cue stay locked to the voice.
Back up assets/vo first; then re-run the generator (it reads audio_meta.json) and re-render.
A 3-minute take usually gives back 10-14 s and reads BETTER — the original pauses are 0.5-0.8 s.
Caps below ~0.18 s start to sound clipped. Verify no cut landed on speech before rendering.

SAMPLE-EXACT lossless PCM splice + re-timed words.
No new TTS: the same recording, with dead air removed. Timing is derived from the ACTUAL frames removed,
so captions and every animation cue stay locked to the voice."""
import json, sys, wave, re, array

proj = sys.argv[1]
CAP_DEFAULT = float(sys.argv[2]) if len(sys.argv) > 2 else 0.24
CAP_BEFORE_STEP = float(sys.argv[3]) if len(sys.argv) > 3 else 0.42
RAMP_MS = 6   # amplitude ramp across the join — no samples consumed, so timing stays exact

meta_p = f"{proj}/assets/vo/audio_meta.json"
meta = json.load(open(meta_p)); sc = meta["scenes"][0]; words = sc["words"]
STEP = {"satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan"}
norm = lambda s: re.sub(r"[^a-z]", "", s.lower())

wav_p = f"{proj}/assets/vo/vo.wav"
w = wave.open(wav_p, "rb")
nch, sw, sr, nfr = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
assert sw == 2 and nch == 1, "expected 16-bit mono PCM"
pcm = array.array("h"); pcm.frombytes(w.readframes(nfr)); w.close()

# frame-exact cut list
cuts = []
for i in range(len(words) - 1):
    a_end, b_start = words[i]["end"], words[i + 1]["start"]
    nxt = words[i + 1]["text"]
    cap = CAP_BEFORE_STEP if (norm(nxt) in STEP and nxt[:1].isupper()) else CAP_DEFAULT
    if b_start - a_end > cap:
        keep = cap / 2.0
        cs, ce = int(round((a_end + keep) * sr)), int(round((b_start - keep) * sr))
        if ce > cs: cuts.append((cs, ce))
cuts.sort()

ramp = int(RAMP_MS / 1000.0 * sr)
out = array.array("h"); pos = 0
for cs, ce in cuts:
    if cs < pos: continue
    seg = pcm[pos:cs]
    n = min(ramp, len(seg))
    for k in range(n):                        # fade the tail down into the join
        seg[len(seg) - n + k] = int(seg[len(seg) - n + k] * (1 - k / n))
    out.extend(seg); pos = ce
tail = pcm[pos:]
out.extend(tail)

# fade UP the first `ramp` samples after each join, in place on the output
idx = 0
for cs, ce in cuts:
    idx += (cs - (cuts[cuts.index((cs, ce)) - 1][1] if cuts.index((cs, ce)) else 0))
# simpler: recompute join positions in the OUTPUT stream
join_out = []; acc = 0; prev_end = 0
for cs, ce in cuts:
    join_out.append(cs - acc)          # index in `out` where the post-cut audio resumes
    acc += (ce - cs); prev_end = ce
for j in join_out:
    n = min(ramp, len(out) - j)
    for k in range(n):
        out[j + k] = int(out[j + k] * (k / n))

removed_fr = nfr - len(out)
new_dur = len(out) / sr

ow = wave.open(wav_p, "wb")
ow.setnchannels(nch); ow.setsampwidth(sw); ow.setframerate(sr)
ow.writeframes(out.tobytes()); ow.close()

# re-time from the ACTUAL frames removed
def shift(t):
    f = t * sr; d = 0
    for cs, ce in cuts:
        if ce <= f: d += (ce - cs)
        elif cs < f < ce: d += (f - cs)
    return round((f - d) / sr, 4)

for wd in words:
    wd["start"], wd["end"] = shift(wd["start"]), shift(wd["end"])
sc["duration"] = round(new_dur, 4)
json.dump(meta, open(meta_p, "w"), ensure_ascii=False)

wp = f"{proj}/assets/vo/vo.words.json"
try:
    ww = json.load(open(wp)); lst = ww["words"] if isinstance(ww, dict) and "words" in ww else ww
    if isinstance(lst, list):
        for i, wd in enumerate(lst):
            if i < len(words) and isinstance(wd, dict) and "start" in wd:
                wd["start"], wd["end"] = words[i]["start"], words[i]["end"]
        json.dump(ww, open(wp, "w"), ensure_ascii=False)
except Exception as ex: print("  (vo.words.json not re-timed:", ex, ")")

print(f"cuts {len(cuts)}  removed {removed_fr/sr:.3f}s  VO {nfr/sr:.2f} -> {new_dur:.2f}s")
t = 0.35 + new_dur + 1.5
print(f"projected video total {t:.2f}s = {int(t//60)}:{t%60:05.2f}")
print(f"last word ends at {words[-1]['end']:.2f}s (audio is {new_dur:.2f}s) — drift check: {new_dur - words[-1]['end']:.3f}s trailing")
