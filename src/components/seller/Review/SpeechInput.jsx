// SpeechInput.jsx
import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const SpeechInput = ({ value, onChange, disabled, placeholder }) => {
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef(null);
  const timeoutRef = useRef(null);
  const accumulatedTextRef = useRef("");

  // Speech SDK Configuration
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

  const startRecognition = () => {
    if (recognizerRef.current) {
      stopRecognition();
    }

    accumulatedTextRef.current = value;
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    recognizer.recognizing = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
        onChange(accumulatedTextRef.current + " " + e.result.text);
      }
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        if (e.result.text.trim()) {
          accumulatedTextRef.current += " " + e.result.text;
          onChange(accumulatedTextRef.current.trim());
        }
      }
    };

    recognizer.sessionStarted = () => {
      setIsListening(true);
      timeoutRef.current = setTimeout(() => {
        stopRecognition();
      }, 30000); // Stop after 30 seconds
    };

    recognizer.sessionStopped = () => {
      setIsListening(false);
      stopRecognition();
    };

    recognizer.canceled = (s, e) => {
      console.error(`CANCELED: Reason=${e.reason}`);
      stopRecognition();
    };

    recognizer.startContinuousRecognitionAsync(
      () => setIsListening(true),
      (err) => {
        console.error("Error starting recognition:", err);
        setIsListening(false);
      }
    );
  };

  const stopRecognition = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          recognizerRef.current?.close();
          recognizerRef.current = null;
          setIsListening(false);
          clearTimeout(timeoutRef.current);
        },
        (err) => {
          console.error("Error stopping recognition:", err);
          setIsListening(false);
          clearTimeout(timeoutRef.current);
        }
      );
    }
  };

  useEffect(() => {
    return () => {
      stopRecognition();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="mb-8">
      <div className="border border-gray-300 rounded-lg p-5 min-h-28 relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full resize-none border-none focus:outline-none"
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          onClick={handleMicClick}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isListening ? "bg-gray-200" : "hover:bg-gray-100"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={disabled}
        >
          {isListening ? <Mic size={22} /> : <MicOff size={22} />}
        </button>
      </div>
      {isListening && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse inline-block"></span>
          Microphone Active - Listening...
        </div>
      )}
    </div>
  );
};

export default SpeechInput;