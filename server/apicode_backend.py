from flask import Blueprint, jsonify, request
import os
import re
import language_tool_python  # For grammar correction
from gtts import gTTS
import speech_recognition as sr  # For speech recognition
from pydub import AudioSegment  # For audio conversion
from pydub.utils import which  # Import the which function
import tempfile  # To handle temporary files
from nltk.corpus import cmudict  # CMU Pronouncing Dictionary for phonemes

AudioSegment.converter = "C:/Program Files/ffmpeg-2024-11-25-git-04ce01df0b-essentials_build/bin/ffmpeg.exe" # Explicitly set the path to ffmpeg

# Create a Blueprint for ApiCode
apicode = Blueprint('apicode', __name__)

# Ensure the static directory exists for storing audio files
if not os.path.exists("static"):
    os.makedirs("static")

# Initialize LanguageTool instance for English
tool = language_tool_python.LanguageTool('en-US')

# Initialize CMU Pronouncing Dictionary
cmu_dict = cmudict.dict()

##################################
# Pronunciation Route
##################################
@apicode.route('/api/pronounce', methods=['GET'])
def pronounce():
    """Generates a pronunciation audio file for a given word."""
    word = request.args.get('word')  # Get the 'word' parameter from the request
    if not word:
        return jsonify({"error": "No word provided"}), 400  # Return an error if no word is provided

    try:
        print(f"Received word: {word}")  # Debugging: Log the word received

        # Generate the pronunciation audio using gTTS
        tts = gTTS(text=word, lang='en')

        # Save the audio file in the static folder
        audio_filename = f"{word}.mp3"
        audio_path = os.path.join("static", audio_filename)
        print(f"Saving audio file at: {audio_path}")  # Debugging: Log the file save path

        tts.save(audio_path)  # Save the audio file
        print("Audio file saved successfully.")  # Debugging: Log success

        # Return the URL to access the audio file
        return jsonify({"audioUrl": f"/static/{audio_filename}"}), 200
    except Exception as e:
        print(f"Error generating pronunciation: {e}")  # Debugging: Log errors
        return jsonify({"error": "Failed to generate pronunciation"}), 500


##################################
# Grammar Check Route
##################################
@apicode.route('/api/grammar-check', methods=['POST'])
def grammar_check():
    """Analyzes text for grammar mistakes and provides suggestions."""
    data = request.json
    text = data.get('text', '')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Perform grammar check
        matches = tool.check(text)
        corrections = []

        for match in matches:
            print(f"Matched Text: {match.matchedText}, Suggestions: {match.replacements[:1]}")  # Debugging output
            corrections.append({
                "mistake": match.matchedText,  # Only the incorrect word
                "suggestions": match.replacements[:1]  # First suggestion only
            })

        return jsonify({"corrections": corrections}), 200
    except Exception as e:
        print(f"Error during grammar check: {e}")
        return jsonify({"error": "Failed to analyze grammar"}), 500



##################################
# Pronunciation Feedback with Phoneme Analysis
##################################
@apicode.route('/api/pronunciation-feedback', methods=['POST'])
def pronunciation_feedback():
    try:
        # Check if audioFile is provided
        if 'audioFile' not in request.files:
            return jsonify({"error": "Audio file is required"}), 400

        # Get uploaded audio file
        audio_file = request.files['audioFile']

        # Save the uploaded audio
        original_audio_path = os.path.join("static", "audio.wav")
        audio_file.save(original_audio_path)

        # Debugging: Log file path
        print(f"Audio file saved at: {original_audio_path}")

        # Convert to .wav if needed and save as temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_path = temp_file.name

        sound = AudioSegment.from_file(original_audio_path)
        sound.export(temp_path, format="wav")

        # Debugging: Log temporary file path
        print(f"Temporary audio file path: {temp_path}")

        # Recognize speech from the audio
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_path) as source:
            audio_data = recognizer.record(source)

        # Google Speech Recognition
        recognized_word = recognizer.recognize_google(audio_data).lower()

        # Debugging: Log recognized word
        print(f"Recognized word: {recognized_word}")

        # Validate recognized word in CMU Pronouncing Dictionary
        if recognized_word in cmu_dict:
            # Fetch phonetic transcription
            recognized_phonemes = cmu_dict[recognized_word][0]  # Use the first pronunciation
            recognized_phoneme_str = " ".join(recognized_phonemes)
            recognized_phoneme_str = re.sub(r'\d', '', recognized_phoneme_str)

            return jsonify({
                "feedback": "Your pronunciation is correct",
                "detectedWord": recognized_word,
                "recognizedPhonetic": recognized_phoneme_str
            }), 200
        else:
            # If recognized word not found in CMU dictionary
            return jsonify({
                "feedback": "Could not match the recognized word to the phonetic dictionary",
                "detectedWord": recognized_word,
                "recognizedPhonetic": "N/A"
            }), 200

    except sr.UnknownValueError:
        return jsonify({"error": "Could not understand the audio"}), 500
    except sr.RequestError as e:
        print(f"Error with the speech recognition service: {e}")
        return jsonify({"error": "Failed to process the audio"}), 500
    except Exception as e:
        # Debugging: Log unexpected errors
        print(f"Error during pronunciation feedback: {e}")
        return jsonify({"error": "An error occurred while analyzing pronunciation"}), 500


