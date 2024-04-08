import wave
import json

from vosk import Model, KaldiRecognizer, SetLogLevel

class custom_Word:
    ''' A class representing a word from the JSON format for vosk speech recognition API '''

    def __init__(self, dict):
        '''
        Parameters:
          dict (dict) dictionary from JSON, containing:
            conf (float): degree of confidence, from 0 to 1
            end (float): end time of the pronouncing the word, in seconds
            start (float): start time of the pronouncing the word, in seconds
            word (str): recognized word
        '''

        self.conf = dict["conf"]
        self.end = dict["end"]
        self.start = dict["start"]
        self.word = dict["word"]

    def to_string(self):
        ''' Returns a string describing this instance '''
        return "{:20} from {:.2f} sec to {:.2f} sec, confidence is {:.2f}%".format(
            self.word, self.start, self.end, self.conf*100)
    



mp3_file = "html/static/storyboard/credits/tracks/output.wav"

model_path = "backend/vosk-model-en-us-0.22"
audio_filename = mp3_file

model = Model(model_path)
wf = wave.open(audio_filename, "rb")
rec = KaldiRecognizer(model, wf.getframerate())
rec.SetWords(True)

# get the list of JSON dictionaries
results = []
# recognize speech using vosk model
while True:
    data = wf.readframes(4000)
    if len(data) == 0:
        break
    if rec.AcceptWaveform(data):
        part_result = json.loads(rec.Result())
        results.append(part_result)
part_result = json.loads(rec.FinalResult())
results.append(part_result)

# convert list of JSON dictionaries to list of 'Word' objects
list_of_words = []
for sentence in results:
    if len(sentence) == 1:
        # sometimes there are bugs in recognition 
        # and it returns an empty dictionary
        # {'text': ''}
        continue
    for obj in sentence['result']:
        w = custom_Word(obj)  # create custom Word object
        list_of_words.append(w)  # and add it to list

wf.close()  # close audiofile

# output to the screen
for word in list_of_words:
    print(word.to_string())





exit()

import json
import whisper_timestamped as whisper

mp3_file = "html/static/storyboard/credits/tracks/Code of Dreams-2.mp3"

audio = whisper.load_audio(mp3_file)
model = whisper.load_model("base")

result = whisper.transcribe(model, audio, language="en")

#print(json.dumps(result, indent = 2, ensure_ascii = False))
for i, segment in enumerate(result['segments']):
  start, end = segment['start'], segment['end']
  print(i)
  print(f"00:00:{str(int(start)).replace('.', ',')} --> 00:00:{str(int(end)).replace('.', ',')}")
  print(segment['text'].strip())
  print()

