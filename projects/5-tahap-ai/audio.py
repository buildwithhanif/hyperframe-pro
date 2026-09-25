#!/usr/bin/env python3
"""audio.py: music + SFX synthesized (no samples, no licences, no API), mixed with the voice-over.

    python3 audio.py .

Reads assets/audio/cues.json (written by build.mjs): one music SECTION per stage, cut on the stage's cue
word, plus every SFX at its cue time. Mixes assets/vo/vo.wav on top with the music ducked under it. Writes assets/audio/mix.wav at -14 LUFS.

The music follows the arc: playful (denial), hard and fast (anger), hesitant (bargaining), no drums and
rain (depression), bright (acceptance). Everything sits on one 100 BPM grid from t=0, so a section change
never lands off the beat.
"""
import json, os, subprocess, sys, wave
import numpy as np

proj = sys.argv[1] if len(sys.argv) > 1 else "."
cues = json.load(open(os.path.join(proj, "assets/audio/cues.json")))
SR = 44100
TOTAL = cues["total"]
N = int(TOTAL * SR) + SR
rng = np.random.default_rng(7)
BEAT = 0.6  # 100 BPM

def t_(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, decay=0.3):
    t = t_(d); e = np.exp(-t / decay)
    k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k)
    return e
def lowpass(x, cut):
    a = np.exp(-2 * np.pi * cut / SR); y = np.empty_like(x); z = 0.0
    for i, v in enumerate(x): z = (1 - a) * v + a * z; y[i] = z
    return y
def add(buf, x, at, g=1.0):
    i = int(at * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(x)); buf[i:j] += g * x[: j - i]
NOTE = lambda n: 440.0 * 2 ** ((n - 69) / 12)

# ---------------------------------------------------------------- instruments
def kick(g=1.0):
    t = t_(0.4); f = 45 + 70 * np.exp(-t / 0.04)
    return g * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
def snare():
    t = t_(0.2); n = rng.standard_normal(len(t))
    return (0.5 * np.diff(n, prepend=0) + 0.4 * np.sin(2 * np.pi * 185 * t)) * np.exp(-t / 0.06)
def hat(d=0.05):
    n = rng.standard_normal(int(d * SR)); h = np.diff(n, prepend=0)
    return lowpass(h, 9000) * np.exp(-t_(d) / 0.012) * 0.5
def clap():
    x = np.zeros(int(0.2 * SR))
    for o in (0, 0.011, 0.022): add(x, np.diff(rng.standard_normal(int(0.15 * SR)), prepend=0) * env(0.15, 0.001, 0.03), o)
    return x * 0.5
def marimba(n, d=0.5):
    t = t_(d); f = NOTE(n)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.03)) * env(d, 0.002, 0.18)
def epiano(n, d=1.2):
    t = t_(d); f = NOTE(n)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)) * env(d, 0.004, 0.5)
def bass(n, d=0.5, dirt=0.0):
    t = t_(d); f = NOTE(n)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sign(np.sin(2 * np.pi * f * t))
    if dirt: x = np.tanh(dirt * (2 * ((f * t) % 1) - 1)) * 0.8 + 0.4 * np.sin(2 * np.pi * f * t)
    return x * env(d, 0.004, d * 0.6)
def pad(notes, d):
    t = t_(d); x = np.zeros(len(t))
    for n in notes:
        for det in (-0.12, 0.12): x += 2 * ((NOTE(n) * 2 ** (det / 12) * t) % 1) - 1
    x = lowpass(x / (2 * len(notes)), 900)
    a = min(len(t), int(0.5 * SR)); x[:a] *= np.linspace(0, 1, a); x[-a:] *= np.linspace(1, 0, a)
    return x

# chords as MIDI: root for the bass + triad for plucks/pads
C, Am, F, G = (48, [60, 64, 67]), (45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62])
Cm, Ab, Bb = (48, [60, 63, 67]), (44, [56, 60, 63]), (46, [58, 62, 65])
STYLE = {
    "hook":       dict(prog=[C, Am, F, G], kick=[0, 2], hat=8, pluck="arp8", bass=True, g=0.9),
    "denial":     dict(prog=[C, Am, F, G], kick=[0, 2], hat=8, pluck="arp8", bass=True, g=0.85),
    "anger":      dict(prog=[Cm, Cm, Ab, Bb], kick=[0, 1, 2, 3], snare=[1, 3], hat=16, dirt=3.0, g=0.95),
    "bargaining": dict(prog=[F, C, G, Am], kick=[0], hat=4, pluck="off", bass=True, g=0.8),
    "depression": dict(prog=[Am, F, C, G], padg=0.5, piano=True, g=0.8),
    "acceptance": dict(prog=[C, G, Am, F], kick=[0, 2], clap=[1, 3], hat=8, pluck="arp16", bass=True, padg=0.25, g=0.9),
    "cta":        dict(prog=[F, G, C, Am], kick=[0, 2], clap=[1, 3], hat=8, pluck="arp16", bass=True, padg=0.25, g=0.9),
}

def render_section(st, a, b):
    """Render style `st` over the global grid, for bars overlapping [a, b)."""
    x = np.zeros(N)
    bar = 4 * BEAT
    for k in range(int(a // bar), int(b // bar) + 1):
        t0 = k * bar; root, tri = st["prog"][k % 4]
        for beat in range(4):
            tb = t0 + beat * BEAT
            if beat in st.get("kick", []): add(x, kick(), tb, 0.9)
            if beat in st.get("snare", []): add(x, snare(), tb, 0.55)
            if beat in st.get("clap", []): add(x, clap(), tb, 0.5)
            if st.get("dirt"):
                for e in range(2): add(x, bass(root - 12, BEAT / 2, st["dirt"]), tb + e * BEAT / 2, 0.42)
            elif st.get("bass"): add(x, bass(root - 12, BEAT * 0.9), tb, 0.4)
        h = st.get("hat")
        if h:
            for i in range(h): add(x, hat(), t0 + i * bar / h, 0.07 if i % 2 else 0.11)
        pl = st.get("pluck")
        seq = tri + [tri[1] + 12, tri[0] + 12, tri[2], tri[1], tri[0] + 12]
        if pl == "arp8":
            for i in range(8): add(x, marimba(seq[i % len(seq)] + 12), t0 + i * BEAT / 2, 0.22)
        elif pl == "arp16":
            for i in range(16): add(x, marimba(seq[i % len(seq)] + 12, 0.3), t0 + i * BEAT / 4, 0.16)
        elif pl == "off":
            for i in (1, 3, 5, 6): add(x, marimba(tri[i % 3] + 12), t0 + i * BEAT / 2, 0.22)
        if st.get("padg"): add(x, pad(tri, bar + 0.4), t0, st["padg"])
        if st.get("piano"):
            for i, n in enumerate([tri[0] + 12, tri[2], tri[1] + 12, tri[2]]): add(x, epiano(n, 1.4), t0 + i * BEAT, 0.2)
    return x * st["g"]

music = np.zeros(N)
secs = cues["sections"]
XF = 0.12
for i, s in enumerate(secs):
    a = s["t"]; b = secs[i + 1]["t"] if i + 1 < len(secs) else TOTAL
    x = render_section(STYLE[s["name"]], max(0, a - XF), b + XF)
    m = np.zeros(N); ia, ib = int(max(0, a - XF) * SR), int(min(TOTAL, b + XF) * SR)
    m[ia:ib] = 1
    k = int(XF * SR)
    if a > 0: m[ia:ia + 2 * k] = np.linspace(0, 1, 2 * k)
    if b < TOTAL: m[ib - 2 * k:ib] = np.linspace(1, 0, 2 * k)
    music += x * m
# the last chord rings out instead of stopping dead
fade = int(1.4 * SR); end = int(TOTAL * SR)
music[end - fade:end] *= np.linspace(1, 0, fade) ** 1.5
music[end:] = 0
add(music, pad(C[1] + [72], 1.6), TOTAL - 1.8, 0.3)
music = music[:N]

# ---------------------------------------------------------------- SFX
def chirp(f0, f1, d, decay=None):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.002, decay or d / 3)
def noise_sweep(d, c0, c1, g=1.0):
    n = rng.standard_normal(int(d * SR)); y = np.empty_like(n); z = 0.0
    for i, v in enumerate(n):
        c = c0 * (c1 / c0) ** (i / len(n)); a = np.exp(-2 * np.pi * c / SR); z = (1 - a) * v + a * z; y[i] = z
    e = np.sin(np.pi * np.arange(len(n)) / len(n)) ** 2
    return g * y * e / (np.abs(y).max() + 1e-9)
def bell(f, d=1.2):
    t = t_(d); return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (0.5 / m)) for m, a in ((1, 1), (2.76, 0.4), (5.4, 0.2)))
def trombone(n, d):
    t = t_(d); f = NOTE(n) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * t) * (t > 0.15))
    x = 2 * ((np.cumsum(f) / SR) % 1) - 1
    e = np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.08)
    return lowpass(x, 1200) * e

def mixs(*xs):
    """Sum arrays of different lengths (pads the short ones)."""
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[: len(x)] += x
    return out

def arp_bells(notes, gap):
    x = np.zeros(int((gap * len(notes) + 1.0) * SR))
    for i, n in enumerate(notes): add(x, bell(NOTE(n), 1.0), i * gap)
    return x

SFX = {
    "whoosh": lambda: noise_sweep(0.45, 300, 5000, 0.9),
    "thump":  lambda: mixs(kick() * 1.3, 0.2 * noise_sweep(0.08, 2000, 800)),
    "pop":    lambda: chirp(500, 1300, 0.09, 0.05),
    "tick":   lambda: np.sin(2 * np.pi * 2400 * t_(0.025)) * env(0.025, 0.001, 0.006),
    "stamp":  lambda: mixs(kick() * 1.2, 0.6 * noise_sweep(0.12, 3000, 600)),
    "hit":    lambda: np.tanh(3 * mixs(kick() * 1.4, 0.8 * noise_sweep(0.4, 4000, 300))) * 0.9,
    "hiss":   lambda: np.diff(noise_sweep(1.4, 2000, 6000), prepend=0) * 4,
    "drain":  lambda: np.concatenate([chirp(700 - 90 * i, 300 - 30 * i, 0.22, 0.08) for i in range(5)]),
    "ding":   lambda: bell(1320) * 0.6,
    "riser":  lambda: chirp(250, 1300, 0.8, 2.0) * np.linspace(0, 1, int(0.8 * SR)) * 0.6 + 0.3 * noise_sweep(0.8, 500, 7000),
    "wahwah": lambda: np.concatenate([trombone(55, 0.34), trombone(54, 0.34), trombone(53, 0.34), trombone(52, 1.0)]) * 0.7,
    "thud":   lambda: np.sin(2 * np.pi * 58 * t_(0.5)) * env(0.5, 0.003, 0.15),
    "rain":   lambda: lowpass(lowpass(rng.standard_normal(int(2.6 * SR)), 1400), 1400) * np.sin(np.pi * np.arange(int(2.6 * SR)) / int(2.6 * SR)) * 1.6,
    "chime":  lambda: arp_bells([84, 88, 91, 96], 0.09) * 0.35,
    "blip":   lambda: chirp(900, 1500, 0.07, 0.04),
    "buzz":   lambda: np.sign(np.sin(2 * np.pi * 110 * t_(0.45))) * env(0.45, 0.005, 0.3) * 0.5,
    "boing":  lambda: np.sin(2 * np.pi * np.cumsum(420 + 160 * np.sin(2 * np.pi * 14 * t_(0.22))) / SR) * env(0.22, 0.002, 0.08),
}
fx = np.zeros(N)
for e in cues["sfx"]:
    add(fx, SFX[e["name"]](), e["t"], e["vol"])

# the voice-over, and the music ducking under it (~-9 dB while he talks, back up in the gaps)
vo = np.zeros(N)
vp = os.path.join(proj, cues.get("vo", ""))
if cues.get("vo") and os.path.exists(vp):
    with wave.open(vp) as w:
        v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2: v = v.reshape(-1, 2).mean(1)
    add(vo, v, cues.get("voStart", 0.35))
    hop = SR // 100; e = np.sqrt(np.convolve(vo ** 2, np.ones(hop) / hop, "same"))
    talk = (e > 0.02).astype(float)
    k = int(0.25 * SR); talk = np.convolve(talk, np.ones(k) / k, "same")      # 250 ms attack/release
    duck = 1 - 0.65 * np.clip(talk * 1.5, 0, 1)
else:
    duck = np.ones(N)
mix = 0.34 * music * duck + 0.5 * fx * (1 - 0.3 * (1 - duck)) + 0.95 * vo
mix = np.tanh(1.2 * mix) / np.tanh(1.2)
mix = mix[: int(TOTAL * SR)]
raw = os.path.join(proj, "assets/audio/_raw.wav")
with wave.open(raw, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix / (np.abs(mix).max() + 1e-9) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
out = os.path.join(proj, "assets/audio/mix.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "2", out], check=True)
os.remove(raw)
print(f"audio: {TOTAL:.2f}s, {len(cues['sfx'])} sfx, {len(secs)} sections -> {out}")
