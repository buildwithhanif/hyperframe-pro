"""swap-line.py — replace ONE spoken line in a finished take without re-recording it (the revision workflow).

    python3 swap-line.py <projectDir> --find "<exact phrase in the VO>" --replace "<new text>" [--dry-run]

Why: a CTA, a price or a claim changes after the voice is rendered. Re-recording the whole script throws
away a take that is already approved and re-times every cue in the video. This swaps the one line:

  1. finds the phrase's word span in assets/vo/audio_meta.json
  2. generates ONLY the new sentence — same voice / model / seed / voice_settings, and the surrounding
     sentences passed as previous_text + next_text so the prosody matches the take it lands in
  3. splices it into vo.wav sample-exactly, level-matched to the speech either side (a separately
     loudnormed clip sits at a different level and the seam is audible)
  4. re-times every downstream word by the ACTUAL inserted length (a mistake this cost us once: never by the requested one)
  5. prints the NEW cue words, because the generator's TA() calls for the old words will now throw

Always --dry-run first: it prints the span, the context and the shift without spending a TTS call.
assets/vo/ is backed up to assets/vo.bak-<n>/ before anything is written.
Afterwards: re-cue the beat in the generator, rebuild, lint, probe, render (the revision workflow).
"""
import json, os, re, sys, wave, array, math, shutil, urllib.request

def die(m): print(f"swap-line: {m}", file=sys.stderr); sys.exit(1)

a = sys.argv[1:]
if not a or a[0].startswith("--"): die("usage: swap-line.py <projectDir> --find '…' --replace '…' [--dry-run]")
proj = a[0]
def opt(name, default=None):
    return a[a.index(name) + 1] if name in a else default
FIND, REPL = opt("--find"), opt("--replace")
DRY = "--dry-run" in a
PRE, POST = float(opt("--pad-pre", 0.30)), float(opt("--pad-post", 0.38))
RAMP_MS = 6
if not FIND or (not REPL and not DRY): die("--find and --replace are required")

meta_p = os.path.join(proj, "assets/vo/audio_meta.json")
meta = json.load(open(meta_p)); sc = meta["scenes"][0]; W = sc["words"]
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())

# locate the phrase as a run of words
target = [norm(x) for x in FIND.split() if norm(x)]
lo = hi = None
for i in range(len(W) - len(target) + 1):
    if [norm(W[j]["text"]) for j in range(i, i + len(target))] == target:
        lo, hi = i, i + len(target) - 1; break
if lo is None: die(f"phrase not found in the take: {FIND!r}\n  (match is word-by-word on letters/digits only)")

prev_ctx = " ".join(x["text"] for x in W[max(0, lo - 22):lo])
next_ctx = " ".join(x["text"] for x in W[hi + 1:hi + 23])
old_span = (W[lo]["start"], W[hi]["end"])
print(f"found words {lo}..{hi}  {old_span[0]:.2f}–{old_span[1]:.2f}s ({old_span[1]-old_span[0]:.2f}s)")
print(f"  removing : {' '.join(x['text'] for x in W[lo:hi+1])}")
print(f"  prev ctx : …{prev_ctx[-90:]}")
print(f"  next ctx : {next_ctx[:90]}…")
if lo == 0 or hi == len(W) - 1: print("  ! span touches the start/end of the take — check the padding by ear")
if DRY:
    print(f"  would insert: {REPL!r}" if REPL else "  (no --replace given)")
    print("dry run: nothing written."); sys.exit(0)

# ---- generate just the new line, in context
key = os.environ.get("ELEVENLABS_API_KEY")
if not key:
    envf = os.path.expanduser("~/.config/hyperframe-pro/.env")
    m = re.search(r"^ELEVENLABS_API_KEY=(\S+)", open(envf).read(), re.M) if os.path.exists(envf) else None
    key = m.group(1) if m else None
if not key: die("ELEVENLABS_API_KEY missing (env or ~/.config/hyperframe-pro/.env)")

cfgs = [p for p in (os.path.join(proj, "../../pipeline"), os.path.join(proj, "..")) if os.path.isdir(p)]
slug = os.path.basename(os.path.abspath(proj))
cfg = None
for d in cfgs:
    p = os.path.join(d, f"{slug}.script.json")
    if os.path.exists(p): cfg = json.load(open(p)); break
if cfg is None: die(f"cannot find {slug}.script.json next to the project (looked in {cfgs})")

body = {"text": REPL, "model_id": cfg.get("modelId", "eleven_multilingual_v2"),
        "language_code": cfg.get("language", "id"), "seed": cfg.get("seed", 42),
        "voice_settings": cfg["voiceSettings"], "previous_text": prev_ctx, "next_text": next_ctx,
        "apply_text_normalization": "auto"}
url = f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['voiceId']}/with-timestamps?output_format=mp3_44100_128"
req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                             headers={"xi-api-key": key, "Content-Type": "application/json"})
with urllib.request.urlopen(req, timeout=180) as r: j = json.loads(r.read())

raw = os.path.join(proj, "raw/linefix"); os.makedirs(raw, exist_ok=True)
open(os.path.join(raw, "line.mp3"), "wb").write(__import__("base64").b64decode(j["audio_base64"]))
al = j.get("normalized_alignment") or j["alignment"]
ch, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
NW, cur = [], None
for i, c in enumerate(ch):
    if c.isspace():
        if cur: NW.append(cur); cur = None
        continue
    cur = {"text": c, "start": st[i], "end": en[i]} if not cur else {**cur, "text": cur["text"] + c, "end": en[i]}
if cur: NW.append(cur)
os.system(f'ffmpeg -v error -y -i "{raw}/line.mp3" -af loudnorm=I=-16:TP=-1.5:LRA=9:linear=true -ar 44100 -ac 1 "{raw}/line.wav"')

# ---- splice
def rd(p):
    w = wave.open(p, "rb"); n = w.getnframes(); d = array.array("h"); d.frombytes(w.readframes(n))
    sr, nch = w.getframerate(), w.getnchannels(); w.close(); return d, sr, nch
old, sr, nch = rd(os.path.join(proj, "assets/vo/vo.wav"))
if nch != 1: die("expected mono PCM")
new, sr2, _ = rd(os.path.join(raw, "line.wav"))
if sr2 != sr: die(f"sample-rate mismatch {sr2} vs {sr}")

n = 1
while os.path.exists(os.path.join(proj, f"assets/vo.bak-{n}")): n += 1
shutil.copytree(os.path.join(proj, "assets/vo"), os.path.join(proj, f"assets/vo.bak-{n}"))
print(f"backed up -> assets/vo.bak-{n}")

speech_off = NW[0]["start"]
new = new[int(speech_off * sr):int(min(len(new) / sr, NW[-1]["end"] + 0.12) * sr)]
def rms(buf, i0, i1):
    s = buf[max(0, i0):min(len(buf), i1)]
    return math.sqrt(sum(x * x for x in s) / max(1, len(s)))
ref = (rms(old, int(W[max(0, lo - 9)]["start"] * sr), int(W[lo - 1]["end"] * sr)) +
       rms(old, int(W[min(len(W) - 1, hi + 1)]["start"] * sr), int(W[min(len(W) - 1, hi + 9)]["end"] * sr))) / 2
cur_r = rms(new, 0, len(new)) or 1
gain = ref / cur_r
print(f"level match x{gain:.3f} ({20*math.log10(gain):+.2f} dB)")
new = array.array("h", [max(-32768, min(32767, int(x * gain))) for x in new])

head_end = int((W[lo - 1]["end"] + PRE) * sr)
tail_start = int(W[hi]["end"] * sr)
out = array.array("h"); out.extend(old[:head_end]); j1 = len(out)
out.extend(new); out.extend(array.array("h", [0] * int(POST * sr))); j2 = len(out)
out.extend(old[tail_start:])
ramp = int(RAMP_MS / 1000 * sr)
for jx in (j1, j2):
    for k in range(min(ramp, len(out) - jx)): out[jx + k] = int(out[jx + k] * (k / ramp))
    for k in range(min(ramp, jx)):           out[jx - 1 - k] = int(out[jx - 1 - k] * (k / ramp))
w = wave.open(os.path.join(proj, "assets/vo/vo.wav"), "wb")
w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(out.tobytes()); w.close()

start_s, delta = head_end / sr, (j2 / sr) - (tail_start / sr)
ins = [{"id": f"nw{i}", "text": x["text"], "start": round(start_s + x["start"] - speech_off, 3),
        "end": round(start_s + x["end"] - speech_off, 3)} for i, x in enumerate(NW)]
words = W[:lo] + ins + [{**x, "start": round(x["start"] + delta, 3), "end": round(x["end"] + delta, 3)} for x in W[hi + 1:]]
for i, x in enumerate(words): x["id"] = f"w{i}"
sc["words"] = words; sc["duration"] = round(len(out) / sr, 3); sc["speechEnd"] = words[-1]["end"]
sc["text"] = sc["text"].replace(FIND, REPL) if FIND in sc["text"] else sc["text"]
json.dump(meta, open(meta_p, "w"), ensure_ascii=False)

print(f"VO -> {sc['duration']:.2f}s  (downstream shift {delta:+.2f}s)")
print("\nNEW CUE WORDS — the generator's TA() calls for the old line will now throw; use these:")
for x in ins: print(f'  TA("{x["text"].strip(chr(44)+chr(46))}", …)   {x["start"]:.3f}')
print("\nnext: re-cue that beat in pipeline/<slug>.build.mjs, then rebuild + lint + probe + render")
