#!/usr/bin/env python3
"""vo_local.py: the voice-over, made locally. No API key, nothing leaves the machine.

    python3 vo_local.py .

Reads script.json (`lines[]`: role / show / say / pause), speaks every line with the Indonesian Piper voice
(id_ID-news_tts-medium, run by sherpa-onnx), lowers it to a male register with the WORLD vocoder, and joins
the lines with the pauses the script asks for. Writes, in the shape tts.mjs writes:

    assets/vo/vo.wav           44.1 kHz mono, -16 LUFS
    assets/vo/audio_meta.json  every SHOWN word with start/end (what build.mjs chains its cues to)
    assets/vo/mouth.json       mouth-open amount per 1/30 s frame, for the lip-sync

Sentence starts are exact (each line is placed where we put it). Inside a line, words are timed from the
line's own pauses: the text is cut at its punctuation, the audio at its silences, and when the counts agree
each phrase gets its own span; word lengths inside a phrase follow their vowel counts.

Swapping in a better voice later (your own recording, ElevenLabs) only has to reproduce these three files.
"""
import json, os, subprocess, sys, tarfile, urllib.request
import numpy as np

proj = sys.argv[1] if len(sys.argv) > 1 else "."
cfg = json.load(open(os.path.join(proj, "script.json")))
V = cfg["voice"].get("local", cfg["voice"])
CACHE = os.path.expanduser("~/.cache/hyperframe-pro/tts")
MODEL = "vits-piper-id_ID-news_tts-medium"
URL = f"https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/{MODEL}.tar.bz2"
LEAD = 0.0  # build.mjs adds its own VO_START

def ensure_model():
    d = os.path.join(CACHE, MODEL)
    if not os.path.exists(os.path.join(d, "tokens.txt")):
        os.makedirs(CACHE, exist_ok=True)
        tb = os.path.join(CACHE, MODEL + ".tar.bz2")
        print(f"downloading {URL}")
        urllib.request.urlretrieve(URL, tb)
        with tarfile.open(tb) as t: t.extractall(CACHE)
        os.remove(tb)
    return d

def male(x, sr, f0k, warp):
    import pyworld as pw
    x = x.astype(np.float64)
    f0, t = pw.harvest(x, sr, f0_floor=70, f0_ceil=500, frame_period=5)
    sp = pw.cheaptrick(x, f0, t, sr); ap = pw.d4c(x, f0, t, sr)
    n = sp.shape[1]; src = np.minimum(np.arange(n) / warp, n - 1)          # formants down with the pitch
    sp2 = np.array([np.interp(src, np.arange(n), r) for r in sp])
    ap2 = np.array([np.interp(src, np.arange(n), r) for r in ap])
    return pw.synthesize(f0 * f0k, sp2, ap2, sr, frame_period=5).astype(np.float32)

def rms_frames(x, sr, hop):
    n = len(x) // hop
    return np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)

def speech_spans(x, sr, min_gap=0.07):
    """(start, end) of voiced stretches, split at silences longer than min_gap."""
    hop = int(sr * 0.01); r = rms_frames(x, sr, hop); thr = max(r.max() * 0.06, 1e-4)
    on = r > thr; spans = []; i = 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            spans.append([i * hop / sr, j * hop / sr]); i = j
        else: i += 1
    merged = []
    for s in spans:
        if merged and s[0] - merged[-1][1] < min_gap: merged[-1][1] = s[1]
        else: merged.append(s)
    return merged

VOW = set("aiueoAIUEO")
def weight(tok): return max(1, sum(c in VOW for c in tok))

def time_words(tokens, spans):
    """Give each shown token a start/end inside the line's speech spans."""
    phrases, cur = [], []
    for tk in tokens:
        cur.append(tk)
        if tk[-1] in ",.!?": phrases.append(cur); cur = []
    if cur: phrases.append(cur)
    if len(spans) == len(phrases): pairs = list(zip(phrases, spans))
    else: pairs = [(tokens, [spans[0][0], spans[-1][1]])]            # counts disagree: one span for the line
    out = []
    for ph, (a, b) in pairs:
        w = np.array([weight(t) for t in ph], float); edges = a + (b - a) * np.concatenate([[0], np.cumsum(w) / w.sum()])
        for k, t in enumerate(ph): out.append((t, float(edges[k]), float(edges[k + 1])))
    return out

import sherpa_onnx, soundfile as sf
d = ensure_model()
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f"{d}/id_ID-news_tts-medium.onnx", tokens=f"{d}/tokens.txt", data_dir=f"{d}/espeak-ng-data"),
    num_threads=4)))

SR = 22050; parts = []; words = []; lines = []; t = LEAD
for i, ln in enumerate(cfg["lines"]):
    a = tts.generate(ln["say"], sid=0, speed=V.get("speed", 1.0)); SR = a.sample_rate
    x = np.array(a.samples, np.float32)
    if V.get("male"): x = male(x, SR, V["male"]["f0"], V["male"]["formant"])
    sp = speech_spans(x, SR)
    a0 = max(0.0, sp[0][0] - 0.09)                                          # keep soft onsets: an /s/ sits under the threshold
    x = x[int(a0 * SR): int(sp[-1][1] * SR) + int(0.05 * SR)]               # trim the model's own padding
    sp = [[s - a0, e - a0] for s, e in sp]
    for tok, s, e in time_words(ln["show"].split(), sp):
        words.append({"id": f"w{len(words)}", "text": tok, "start": round(t + s, 3), "end": round(t + e, 3), "line": i})
    dur = len(x) / SR
    lines.append({"i": i, "role": ln["role"], "start": round(t, 3), "end": round(t + dur, 3), "show": ln["show"]})
    parts += [x, np.zeros(int(ln.get("pause", 0.3) * SR), np.float32)]
    t += dur + ln.get("pause", 0.3)
    print(f"  {i:2d} {ln['role']} {t - dur - ln.get('pause', 0.3):6.2f}-{t - ln.get('pause', 0.3):6.2f}  {ln['show']}")

vo = np.concatenate(parts); vo /= np.abs(vo).max() + 1e-9; vo *= 0.9
out = os.path.join(proj, "assets/vo"); os.makedirs(out, exist_ok=True)
raw = os.path.join(out, "_raw.wav"); sf.write(raw, vo, SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", "44100", "-ac", "1", os.path.join(out, "vo.wav")], check=True)
os.remove(raw)

# mouth: frame RMS, normalised to the take's loud speech, lightly smoothed; 0 = closed
hop = SR // 30; m = rms_frames(vo, SR, hop); m = m / (np.percentile(m[m > m.max() * 0.05], 90) + 1e-9)
m = np.convolve(np.clip(m, 0, 1.2), [0.25, 0.5, 0.25], "same"); m[m < 0.12] = 0
json.dump([round(float(v), 2) for v in m], open(os.path.join(out, "mouth.json"), "w"))

dur = len(vo) / SR
meta = {"voiceId": V["engine"], "modelId": "vo_local.py", "scenes": [{"id": "vo", "text": " ".join(l["show"] for l in cfg["lines"]), "wav": "vo.wav",
        "duration": round(dur, 3), "speechStart": words[0]["start"], "speechEnd": words[-1]["end"], "words": words, "lines": lines}]}
json.dump(meta, open(os.path.join(out, "audio_meta.json"), "w"), indent=1)
print(f"vo: {dur:.2f}s, {len(words)} words, {len(lines)} lines")
