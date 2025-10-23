#!/usr/bin/env python3
import json
import os
import re
from faster_whisper import WhisperModel

AUDIO_DIR = "./html/static/storyboard/intro/tracks"
JSON_PATH = "./html/static/storyboard/intro/intro_scene.json"
OUT_PATH = "./html/static/storyboard/intro/intro_scene_synced_split.json"

device = "cpu"  # Force CPU mode
model = WhisperModel("medium", device=device, compute_type="int8")

def transcribe_audio_detailed(path):
    """Return detailed list of words with timestamps."""
    segments, _ = model.transcribe(path, word_timestamps=True)
    words = []
    for seg in segments:
        for w in seg.words:
            if not w.word.strip():
                continue
            words.append({
                "timestamp": round(w.start, 3),
                "duration": round(w.end - w.start, 3),
                "text": w.word.strip()
            })
    return words

# step 1: transcribe each mp3 into word-level entries
transcripts = {}
for fname in sorted(os.listdir(AUDIO_DIR)):
    if fname.endswith(".mp3"):
        path = os.path.join(AUDIO_DIR, fname)
        print(f"[+] transcribing {fname}")
        transcripts[fname] = transcribe_audio_detailed(path)

# step 2: load storyboard
with open(JSON_PATH) as f:
    storyboard = json.load(f)

# step 3: attach transcripts word-by-word to matching slides
for slide in storyboard:
    all_words = []
    for audio in slide.get("audio", []):
        name = os.path.basename(audio["path"])
        if name in transcripts:
            # offset each word timestamp by slide’s audio start time
            for w in transcripts[name]:
                w["timestamp"] = round(audio["timestamp"] + w["timestamp"], 3)
                all_words.append(w)
    slide["text"] = all_words

# step 4: write updated storyboard
with open(OUT_PATH, "w") as f:
    json.dump(storyboard, f, indent=2)

print(f"\n[✓] detailed storyboard written to {OUT_PATH}")
