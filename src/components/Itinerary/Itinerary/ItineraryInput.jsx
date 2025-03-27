import { useState, useEffect, useRef } from "react";
import { SendHorizontal, Mic, MicOff, CircleHelp } from "lucide-react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export default function ItineraryInput({ onSearch }) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false); // Disable input & mic while sending
  const [showMessage, setShowMessage] = useState(false);
  const recognizerRef = useRef(null);
  const timeoutRef = useRef(null);
  const accumulatedTextRef = useRef(""); // Store accumulated text

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
      setIsSending(true); // Disable mic and input
      stopRecognition();
      onSearch(text.trim()).finally(() => {
        setIsSending(false); // Re-enable mic and input after response
      });
    }
  };

  const startRecognition = () => {
    if (recognizerRef.current) {
      stopRecognition();
    }

    accumulatedTextRef.current = text; // Preserve previous text
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    recognizer.recognizing = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
        setText(accumulatedTextRef.current + " " + e.result.text); // Append instead of replace
      }
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        if (e.result.text.trim()) {
          accumulatedTextRef.current += " " + e.result.text; // Append recognized text
          setText(accumulatedTextRef.current.trim());
        }
      }
    };

    recognizer.sessionStarted = () => {
      setIsListening(true);
      timeoutRef.current = setTimeout(() => {
        stopRecognition();
      }, 30000);
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
    <div className="-mt-1 max-w-2xl font-[Poppins]">
      {isListening && (
        <div className="mb-4 bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-full shadow-sm inline-flex items-center animate-fade-in">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span>Microphone Active - Listening...</span>
        </div>
      )}

      <h2 className="text-[22px] font-semibold text-gray-900 mb-4">Search</h2>

      <div className="flex items-center border-b-[3px] border-black pb-3 relative w-full">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 outline-none bg-transparent text-black placeholder-gray-600 text-[16px] font-medium tracking-wide"
          maxLength={180}
          placeholder="What's your itinerary?"
          disabled={isSending}
        />
        <SendHorizontal
          className={`cursor-pointer text-gray-800 transition-opacity duration-200 ${isSending ? "opacity-50 cursor-not-allowed" : "hover:opacity-70"}`}
          size={30}
          onClick={!isSending ? handleSendClick : undefined}
        />
      </div>

      <div className="text-right text-gray-500 text-sm mt-1">{text.length}/180</div>

      <div className="flex justify-end space-x-4 mt-4 relative">
        <button
          className={`p-2 rounded-full transition-all duration-200 ${
            isListening ? "bg-gray-200 text-black" : "text-black hover:bg-gray-100"
          } ${isSending ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={!isSending ? handleMicClick : undefined}
          disabled={isSending}
        >
          {isListening ? <Mic size={35} /> : <MicOff size={35} />}
        </button>

        <div className="relative">
          <button className="p-2 text-black rounded-full hover:bg-gray-100 transition-all duration-200" onClick={() => setShowMessage(!showMessage)}>
            <CircleHelp size={35} />
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