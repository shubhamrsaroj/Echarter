import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, HelpCircle } from "lucide-react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export default function ItineraryInput({ onSearch }) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const recognizerRef = useRef(null);
  const tempTextRef = useRef("");
  const timeoutRef = useRef(null); // Ref for timeout

  const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechRecognitionLanguage = "en-US";

  const handleMicClick = () => {
    if (!isListening) {
      startRecognition();
    } else {
      stopRecognition();
    }
  };

  const handleSendClick = () => {
    if (text.trim()) {
      onSearch(text.trim());
    }
  };

  const startRecognition = () => {
    if (recognizerRef.current) {
      console.warn("Recognizer already running. Restarting...");
      stopRecognition();
    }

    tempTextRef.current = "";
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    recognizer.recognizing = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
        tempTextRef.current = e.result.text;
        setText(tempTextRef.current);
      }
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        if (e.result.text.trim()) {
          setText(e.result.text);
          tempTextRef.current = e.result.text;
        }
      }
    };

    recognizer.sessionStarted = () => {
      console.log("Session started.");
      setIsListening(true);
      // Set 1-minute timeout
      timeoutRef.current = setTimeout(() => {
        stopRecognition();
      }, 30000); // 60,000 ms = 1 minute
    };

    recognizer.sessionStopped = () => {
      console.log("Session stopped.");
      setIsListening(false);
      stopRecognition();
    };

    recognizer.canceled = (s, e) => {
      console.error(`CANCELED: Reason=${e.reason}`);
      if (e.reason === sdk.CancellationReason.Error) {
        console.error(`Error details: ${e.errorDetails}`);
      }
      stopRecognition();
    };

    recognizer.startContinuousRecognitionAsync(
      () => {
        console.log("Speech recognition started.");
        setIsListening(true);
      },
      (err) => {
        console.error("Error starting recognition:", err);
        setIsListening(false);
      }
    );
  };

  const stopRecognition = () => {
    if (recognizerRef.current) {
      console.log("Stopping recognition...");
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          console.log("Recognition stopped.");
          recognizerRef.current?.close();
          recognizerRef.current = null;
          setIsListening(false);
          clearTimeout(timeoutRef.current); // Clear timeout
        },
        (err) => {
          console.error("Error stopping recognition:", err);
          setIsListening(false);
          clearTimeout(timeoutRef.current); // Clear timeout on error
        }
      );
    } else {
      console.warn("Recognizer is already stopped or not initialized.");
    }
  };

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        stopRecognition();
      }
      clearTimeout(timeoutRef.current); // Cleanup timeout on unmount
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full relative">
      <label className="block text-gray-600 mb-2">What's your Itinerary?</label>
      <div className="flex items-center border-b border-black pb-1 relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 outline-none bg-transparent text-gray-700"
          maxLength={180}
          placeholder="Write or speak your itinerary..."
        />
        <Send
          className="text-black cursor-pointer hover:text-blue-600"
          size={20}
          onClick={handleSendClick}
        />
        {isListening && (
          <div className="absolute -top-8 left-0 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full shadow-sm flex items-center animate-fade-in">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>Microphone Active - Listening...</span>
          </div>
        )}
      </div>
      <div className="text-right text-gray-400 text-sm mt-1">{text.length}/180</div>

      <div className="flex justify-end space-x-4 mt-4 relative">
        <button
          className={`p-2 rounded-full transition-colors ${
            isListening ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
          onClick={handleMicClick}
        >
          {isListening ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <div className="relative">
          <button
            className="p-2 bg-black text-white rounded-full"
            onClick={() => setShowMessage(!showMessage)}
          >
            <HelpCircle size={20} />
          </button>

          {showMessage && (
            <div className="absolute right-0 top-10 bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg w-48">
              For best results, please speak and write in English only.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}