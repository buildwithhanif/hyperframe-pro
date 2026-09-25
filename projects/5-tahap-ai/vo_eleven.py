#!/usr/bin/env python3
"""vo_eleven.py: the voice-over from ElevenLabs, ONE continuous take with character timestamps.

    python3 vo_eleven.py .             # needs ELEVENLABS_API_KEY (env or ~/.config/hyperframe-pro/.env)
    python3 vo_eleven.py . --dry-run   # prints the request and the line offsets, spends nothing
    python3 vo_eleven.py . --voice <voiceId>

Writes exactly what vo_local.py writes, so build.mjs and audio.py do not change:
    assets/vo/vo.wav, assets/vo/audio_meta.json (shown words + lines), assets/vo/mouth.json

One take, not one call per line: the prosody runs through the whole script the way a person reads it
(hyperframe-pro-voice, "One take. Always."). Each line's `el` text is sent joined into one string. The
character alignment gives every line an exact start/end; the gap between two lines is then set to that
line's `pause` by splicing silence in or taking it out at the quietest point of the gap, and every later
timestamp moves by the samples actually inserted or removed.
The raw take and its alignment are cached in assets/vo/eleven_raw.* so re-running does not re-bill.
"""
import base64, json, os, subprocess, sys, urllib.request
import numpy as np

proj = next((a for a in sys.argv[1:] if not a.startswith("--")), ".")
DRY = "--dry-run" in sys.argv
FORCE = "--force" in sys.argv
cfg = json.load(open(os.path.join(proj, "script.json")))
V = cfg["voice"]
if "--voice" in sys.argv: V["voiceId"] = sys.argv[sys.argv.index("--voice") + 1]
lines = cfg["lines"]
OUT = os.path.join(proj, "assets/vo"); os.makedirs(OUT, exist_ok=True)
SR = 44100

# ---- the request: one string, and where each line sits in it
texts = [l.get("el", l["show"]) for l in lines]
full, offs = "", []
for t in texts:
    if full: full += " "
    offs.append((len(full), len(full) + len(t))); full += t
if DRY:
    print(f"voice {V['voiceId']} model {V['modelId']}  {len(full)} chars")
    for i, (a, b) in enumerate(offs): print(f"  {i:2d} [{a:4d},{b:4d}) {full[a:b]}")
    sys.exit(0)

def key():
    k = os.environ.get("ELEVENLABS_API_KEY")
    f = os.path.expanduser("~/.config/hyperframe-pro/.env")
    if not k and os.path.exists(f):
        for ln in open(f):
            if ln.startswith("ELEVENLABS_API_KEY="): k = ln.split("=", 1)[1].strip()
    if not k: sys.exit("ELEVENLABS_API_KEY missing (env or ~/.config/hyperframe-pro/.env)")
    return k

raw_mp3, raw_al = os.path.join(OUT, "eleven_raw.mp3"), os.path.join(OUT, "eleven_raw.json")
cached = os.path.exists(raw_al) and json.load(open(raw_al)).get("text") == full and json.load(open(raw_al)).get("voiceId") == V["voiceId"]
if FORCE or not cached:
    body = {"text": full, "model_id": V["modelId"], "seed": V.get("seed", 42), "voice_settings": V.get("settings", {})}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V['voiceId']}/with-timestamps?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": key(), "Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=180))
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs HTTP {e.code}: {e.read().decode()[:400]}")
    open(raw_mp3, "wb").write(base64.b64decode(r["audio_base64"]))
    al = r.get("alignment") or r.get("normalized_alignment")
    json.dump({"text": full, "voiceId": V["voiceId"], "alignment": al}, open(raw_al, "w"))
    print(f"eleven: take ok, {len(full)} chars")
else:
    print(f"eleven: REUSING cached take {raw_al} (same text, same voice); --force to re-record")
al = json.load(open(raw_al))["alignment"]
ch, cs, ce = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
if "".join(ch) != full: print("  ! alignment text differs from the request; mapping by position anyway")

# ---- decode the take
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", raw_mp3, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

def span(a, b):
    idx = [i for i in range(a, min(b, len(ch))) if not ch[i].isspace()]
    return cs[idx[0]], ce[idx[-1]]
L = [list(span(a, b)) for a, b in offs]

# ---- set every gap between lines to the script's pause, cutting at the quietest 10 ms of the gap
def quietest(t0, t1):
    a, b = int(t0 * SR), int(t1 * SR); hop = int(0.01 * SR)
    if b - a < 2 * hop: return (t0 + t1) / 2
    e = [np.abs(x[i:i + hop]).mean() for i in range(a, b - hop, hop)]
    return (a + int(np.argmin(e)) * hop + hop // 2) / SR
pieces, shift, cur = [], [], 0          # shift[i] = seconds added before line i
acc = 0.0
for i in range(len(lines)):
    if i == 0:
        lead = max(0.0, L[0][0] - 0.05); cur = int(lead * SR); acc = -lead
        shift.append(acc); continue
    g0, g1 = L[i - 1][1], L[i][0]
    want = lines[i - 1].get("pause", 0.3) + 0.1                     # breath around the words
    have = max(0.0, g1 - g0); cut = quietest(g0, g1) if g1 > g0 else g0
    ci = int(cut * SR)
    pieces.append(x[cur:ci]); cur = ci
    delta = want - have
    if delta > 0: pieces.append(np.zeros(int(round(delta * SR)), np.float32)); acc += int(round(delta * SR)) / SR
    else:
        drop = int(round(-delta * SR)); drop = min(drop, max(0, int((g1 - cut) * SR) - int(0.02 * SR)))
        cur += drop; acc -= drop / SR                                  # remove silence AFTER the cut, before the next word
    shift.append(acc)
end = min(len(x), int((L[-1][1] + 0.08) * SR))
pieces.append(x[cur:end]); pieces.append(np.zeros(int(lines[-1].get("pause", 1.0) * SR), np.float32))
vo = np.concatenate(pieces)

# ---- words: shown tokens timed from the spoken words of the same line
words, outlines = [], []
for i, ((a, b), ln) in enumerate(zip(offs, lines)):
    s0, s1 = L[i][0] + shift[i], L[i][1] + shift[i]
    spoken, j = [], a                                              # spoken word spans inside this line
    while j < b:
        while j < b and full[j].isspace(): j += 1
        k = j
        while k < b and not full[k].isspace(): k += 1
        if k > j: spoken.append((cs[j] + shift[i], ce[k - 1] + shift[i]))
        j = k
    show = ln["show"].split()
    if len(spoken) == len(show): times = spoken
    else:                                                          # counts differ (e.g. "4" vs "empat"): share the line by length
        w = np.array([max(1, len(t)) for t in show], float); e = s0 + (s1 - s0) * np.concatenate([[0], np.cumsum(w) / w.sum()])
        times = [(e[k], e[k + 1]) for k in range(len(show))]
    for t, (ws, we) in zip(show, times):
        words.append({"id": f"w{len(words)}", "text": t, "start": round(ws, 3), "end": round(we, 3), "line": i})
    outlines.append({"i": i, "role": ln["role"], "start": round(s0, 3), "end": round(s1, 3), "show": ln["show"]})

rawwav = os.path.join(OUT, "_raw.wav")
import wave
with wave.open(rawwav, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(vo, -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", rawwav, "-af", "highpass=f=60,loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", str(SR), "-ac", "1", os.path.join(OUT, "vo.wav")], check=True)
os.remove(rawwav)

hop = SR // 30; n = len(vo) // hop
m = np.sqrt((vo[: n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)
m = m / (np.percentile(m[m > m.max() * 0.05], 90) + 1e-9)
m = np.convolve(np.clip(m, 0, 1.2), [0.25, 0.5, 0.25], "same"); m[m < 0.12] = 0
json.dump([round(float(v), 2) for v in m], open(os.path.join(OUT, "mouth.json"), "w"))
dur = len(vo) / SR
json.dump({"voiceId": V["voiceId"], "modelId": V["modelId"], "scenes": [{"id": "vo", "text": " ".join(l["show"] for l in lines), "wav": "vo.wav",
           "duration": round(dur, 3), "speechStart": words[0]["start"], "speechEnd": words[-1]["end"], "words": words, "lines": outlines}]},
          open(os.path.join(OUT, "audio_meta.json"), "w"), indent=1)
for l in outlines: print(f"  {l['i']:2d} {l['role']} {l['start']:6.2f}-{l['end']:6.2f}  {l['show']}")
print(f"vo: {dur:.2f}s, {len(words)} words, {len(outlines)} lines (ElevenLabs {V['voiceId']})")
