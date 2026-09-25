# 5 tahap kreator nerima AI

A 55 s vertical (1080x1920) drawn short with voice-over: the five stages of grief, played by one cartoon
kreator going from "slop" to running the system, then the 1-on-1 offer (the kreator hops from stage 01
straight to 05).

```bash
python3 vo_local.py .     # script.json -> assets/vo/{vo.wav, audio_meta.json, mouth.json}
node build.mjs .          # -> index.html + assets/audio/cues.json
python3 audio.py .        # music + SFX, voice mixed on top, music ducked -> assets/audio/mix.wav
node ../../plugins/hyperframe-pro/scripts/lint.mjs . build.mjs
npx hyperframes check .
node build.mjs . && npx hyperframes render . -o renders/5-tahap-kreator-ai.mp4
```

Needs `pip install sherpa-onnx soundfile pyworld numpy`. `glyphs.py` (fonttools + brotli) only has to run
again if the display font changes.

**The voice.** `vo_local.py` runs the free Indonesian Piper voice (id_ID-news_tts-medium, downloaded once
from the sherpa-onnx GitHub release into `~/.cache/hyperframe-pro/tts`) and lowers it to a male register
with the WORLD vocoder. `script.json` holds each line twice: `show` (on screen, what every cue chains to)
and `say` (respelled so the Indonesian model pronounces the English words). To use a better voice (your
own recording, ElevenLabs), produce the same three files in `assets/vo/`; nothing else changes.

**Change a line:** edit `script.json`, run the chain. A cue whose word is gone throws with the word.
