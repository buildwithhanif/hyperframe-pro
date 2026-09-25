# 5 tahap kreator nerima AI

A 54 s vertical (1080x1920) drawn short: the five stages of grief, played by one cartoon kreator going
from "slop" to running the system, ending on the real story (they blocked the account first).

No voice-over. The on-screen text is the narration, so `clock.mjs` turns `script.json` into a word table
at reading pace and every cue in `build.mjs` chains to a word in it, the same way it would to a VO take.

```bash
node clock.mjs .          # script.json -> assets/vo/audio_meta.json (reading clock)
node build.mjs .          # -> index.html + assets/audio/cues.json
python3 audio.py .        # cues.json -> assets/audio/mix.wav (synth music + SFX, -16 LUFS)
node ../../plugins/hyperframe-pro/scripts/lint.mjs . build.mjs
npx hyperframes check .
node build.mjs . && npx hyperframes render . -o renders/5-tahap-kreator-ai.mp4
```

Needs numpy for `audio.py`. Change a line: edit `script.json`, then run the whole chain; a cue that no
longer exists throws with the word it was looking for. To add a real voice later, generate it with
`tts.mjs` into `assets/vo/` and add its `<audio>` next to the music.
