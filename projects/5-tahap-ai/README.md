# 5 tahap kreator nerima AI

A 55 s vertical (1080x1920) drawn short with voice-over: the five stages of grief, played by one cartoon
kreator going from "slop" to running the system, then the 1-on-1 offer (the kreator hops from stage 01
straight to 05).

```bash
python3 vo_eleven.py .    # script.json -> assets/vo/{vo.wav, audio_meta.json, mouth.json}  (or vo_local.py)
node build.mjs .          # -> index.html + assets/audio/cues.json
python3 audio.py .        # music + SFX, voice mixed on top, music ducked -> assets/audio/mix.wav
node ../../plugins/hyperframe-pro/scripts/lint.mjs . build.mjs
npx hyperframes check .
node build.mjs . && npx hyperframes render . -o renders/5-tahap-kreator-ai.mp4
```

Needs `pip install sherpa-onnx soundfile pyworld numpy`. `glyphs.py` (fonttools + brotli) only has to run
again if the display font changes.

**The voice.** Two interchangeable sources; both write the same three files in `assets/vo/`
(`vo.wav`, `audio_meta.json`, `mouth.json`), so nothing downstream changes.

- `vo_eleven.py`: ElevenLabs, one continuous take with character timestamps. Key in
  `ELEVENLABS_API_KEY` or `~/.config/hyperframe-pro/.env` (chmod 600, never in the repo). Voice and model
  in `script.json` > `voice`; `--voice <id>` overrides; `--dry-run` spends nothing. The raw take is cached
  in `assets/vo/eleven_raw.*`, so re-running re-splices without re-billing (`--force` re-records).
- `vo_local.py`: free fallback, the Indonesian Piper voice lowered to a male register. Robotic; use it
  only to block out timing.

`script.json` holds each line up to three ways: `show` (on screen, what every cue chains to), `el` (as
ElevenLabs reads it: numbers and the handle spelled out) and `say` (respelled for Piper).

**Change a line:** edit `script.json`, run the chain. A cue whose word is gone throws with the word.
