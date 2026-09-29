import React, { useState } from "react";
import { FaMicrophone } from "react-icons/fa"; // Importing microphone icon
import Header from "./Header";

const Pronunciation = () => {
  const [word, setWord] = useState(""); // To store the word for pronunciation
  const [audioUrl, setAudioUrl] = useState(""); // For pronunciation audio
  const [feedback, setFeedback] = useState(""); // Feedback on pronunciation
  const [text, setText] = useState(""); // For grammar checking
  const [corrections, setCorrections] = useState([]); // Grammar corrections
  const [pronunciationError, setPronunciationError] = useState(""); // Error for pronunciation
  const [detectedWord, setDetectedWord] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [feedbackError, setFeedbackError] = useState(""); // Error for feedback
  const [grammarError, setGrammarError] = useState(""); // Error for grammar check
  const [recording, setRecording] = useState(false); // Recording state
  const [audioBlob, setAudioBlob] = useState(null); // To store recorded audio
  const [loading, setLoading] = useState(false); // Loading state for pronunciation
  const [loadingFeedback, setLoadingFeedback] = useState(false); // Loading state for feedback API
  const [loadingGrammar, setLoadingGrammar] = useState(false); // Loading state for feedback API



  // Handle Pronunciation   Audio Generation
  const handlePronounce = async () => {
    if (!word) {
      setPronunciationError("Please enter a word.");
      return;
    }
  
    try {
      setPronunciationError("");
      setAudioUrl("");
      setLoading(true); // Set loading to true before the fetch
  
      const response = await fetch(`http://127.0.0.1:5000/api/pronounce?word=${word}`);
      const data = await response.json();
  
      if (response.ok && data.audioUrl) {
        setAudioUrl(`http://127.0.0.1:5000${data.audioUrl}`);
      } else {
        setPronunciationError(data.error || "Pronunciation not available.");
      }
    } catch (err) {
      console.error(err);
      setPronunciationError("An error occurred while fetching the pronunciation.");
    } finally {
      setLoading(false); // Always reset loading state in the finally block
    }
  };
  

  // Handle Start Recording
  const handleRecording = () => {
    if (!recording) {
      // Start Recording
      setFeedbackError("");
      setFeedback("");
      setRecording(true);

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();

          const audioChunks = [];
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: "audio/wav" });
            setAudioBlob(blob);
          };

          window.mediaRecorder = mediaRecorder;
        })
        .catch((err) => {
          console.error(err);
          setFeedbackError("Failed to access the microphone.");
        });
    } else {
      // Stop Recording and Analyze Pronunciation
      setRecording(false);
      if (window.mediaRecorder) {
        window.mediaRecorder.stop();
      }
      handleAnalyzePronunciation(); // Trigger the API call
    }
  };

  // Handle Stop Recording
  const handleStopRecording = () => {
    setRecording(false);
    if (window.mediaRecorder) {
      window.mediaRecorder.stop();
    }
  };

  // Handle Pronunciation Feedback
  const handleAnalyzePronunciation = async () => {
    if (!audioBlob) {
      setFeedbackError("Please record your voice.");
      return;
    }

    try {
      setFeedbackError("");
      setFeedback("");
      setLoadingFeedback(true); // Start loader

      const formData = new FormData();
      formData.append("audioFile", audioBlob, "audio.wav");

      // Optional: Include the word for phoneme comparison if provided
      if (word) {
        formData.append("expectedWord", word);
      }

      const response = await fetch("http://127.0.0.1:5000/api/pronunciation-feedback", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        setFeedback(data.feedback || "No feedback available.");
        setDetectedWord(data.detectedWord || "No word detected.")
        setPhonetic(data.recognizedPhonetic || "No word detected.")
      } else {
        setFeedbackError(data.error || "Failed to analyze pronunciation.");
      }
    } catch (err) {
      console.error(err);
      setFeedbackError("An error occurred while analyzing pronunciation.");
    } finally {
      setLoadingFeedback(false); // Stop loader
    }
  };


  // Handle Grammar Check
  const handleGrammarCheck = async () => {
    if (!text) {
      setGrammarError("Please enter a sentence.");
      return;
    }
  
    try {
      setGrammarError("");
      setCorrections([]);
      setLoadingGrammar(true); // Start loader for Grammar Check
  
      const response = await fetch("http://127.0.0.1:5000/api/grammar-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.corrections) {
        setCorrections(data.corrections);
      } else {
        setGrammarError(data.error || "Failed to check grammar.");
      }
    } catch (err) {
      console.error(err);
      setGrammarError("An error occurred while checking grammar.");
    } finally {
      setLoadingGrammar(false); // Stop loader for Grammar Check
    }
  };
  

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className=' text-2xl text-center' style={{ color: 'rgb(125, 46, 140)', marginBottom: '60px' }}>
        <span className='font-semibold'>Domain Language Support</span>
      </div>
  
        {/* Main Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Pronunciation and Grammar Check */}
          <div className="flex flex-col gap-6 w-full md:w-2/3">
            {/* Pronunciation Section */}
            <div className="bg-[#f9f9f9] shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Pronunciation
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter a word"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-purple-300"
                />
<button
  onClick={handlePronounce}
  className="bg-[#BC7BDA] text-white max-w-xl px-6 py-2 rounded-lg hover:bg-[#A565C0] transition"
>
  Get Pronunciation
</button>

              </div>
              {loading && (
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-[#BC7BDA] border-solid"></div>
                </div>
              )}
              {audioUrl && !loading && (
                <div className="mt-4">
                  <h3 className="text-sm text-gray-600 mb-2">Pronunciation Audio:</h3>
                  <audio
                    controls
                    src={audioUrl}
                    className="max-w-lg rounded-lg"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              {pronunciationError && (
                <p className="text-red-500 mt-2">{pronunciationError}</p>
              )}
            </div>
  
            {/* Grammar Check Section */}
            <div className="bg-[#f9f9f9] shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Grammar Check</h2>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <input
                  placeholder="Enter a sentence"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-purple-300"
                ></input>
                <button
                  onClick={handleGrammarCheck}
                  className="bg-[#BC7BDA]  text-white px-6 py-2 w-2xl rounded-lg hover:bg-[#A565C0] transition"
                >
                  Check Grammar
                </button>
              </div>
              {loadingGrammar && (
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-[#BC7BDA] border-solid"></div>
                </div>
              )}
              {corrections.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Suggestions:</h3>
                  <ul className="list-disc pl-6 text-gray-800">
                    {corrections.map((correction, index) => (
                      <li key={index} className="mb-2">
                        <span className="text-red-500">{correction.mistake}</span> →{" "}
                        <span className="text-green-500">
                          {correction.suggestions[0] || "No suggestions"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {grammarError && <p className="text-red-500 mt-2">{grammarError}</p>}
            </div>


          </div>
  
          {/* Right Column: Pronunciation Feedback */}
          <div className="bg-[#f9f9f9] shadow-md rounded-lg p-6 w-full md:w-1/3">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Pronunciation Feedback
            </h2>
            <div className="flex flex-col items-center justify-center gap-4">
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer mt-4 ${
                  recording
                    ? "bg-red-500 animate-pulse"
                    : "bg-[#BC7BDA] hover:bg-[#A565C0]"
                } transition`}
                onClick={handleRecording}
              >
                <FaMicrophone className="text-white text-xl" />
              </div>
              {/* Instruction Below Microphone */}
              <p className="text-gray-600 text-sm">
                {recording ? "Tap to stop audio" : "Tap to record audio"}
              </p>
            </div>

            {loadingFeedback && (
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-[#BC7BDA] border-solid"></div>
              </div>
            )}

            {feedback && (
              <p className="text-green-600 mt-4 bg-green-100 p-3 rounded-lg">
                <p>Detected Word: {detectedWord}</p>
                <br></br>
                <p>Phonetic Pronunciation: {phonetic}</p>
                <br></br>
                <p>Feedback: {feedback}</p>
              </p>
            )}
            {feedbackError && (
              <p className="text-red-500 mt-2 text-center">{feedbackError}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
  
  };

export default Pronunciation;
