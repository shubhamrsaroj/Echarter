import { useState, useEffect, useRef } from "react";
import { SendHorizontal, Mic, MicOff, Info } from "lucide-react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { useLocation } from "react-router-dom"; // Add this import
import InfoModal from "../../common/InfoModal";
import { getInfoContent } from "../../../api/infoService";
import { toast } from "react-toastify";

export default function ItineraryInput({ onSearch }) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [infoUrl, setInfoUrl] = useState(null);
  const recognizerRef = useRef(null);
  const timeoutRef = useRef(null);
  const accumulatedTextRef = useRef("");
  const location = useLocation(); // Add this to get navigation state

  const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechRecognitionLanguage = "en-US";

  // Set text from navigation state when component mounts
  useEffect(() => {
    const copiedText = location.state?.copiedText;
    if (copiedText) {
      setText(copiedText);
    }
  }, [location.state]);

  const handleMicClick = () => {
    if (!isListening) {
      startRecognition();
    } else {
      stopRecognition();
    }
  };

  const handleInfoClick = async () => {
    try {
      const url = await getInfoContent('search', 'info');
      setInfoUrl(url);
    } catch (error) {
      console.error('Error loading info content:', error);
      toast.info(error.message || "Failed to load information", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSendClick = () => {
    if (text.trim()) {
      setIsSending(true);
      stopRecognition();
      onSearch(text.trim()).finally(() => {
        setIsSending(false);
      });
    }
  };

  const startRecognition = () => {
    if (recognizerRef.current) {
      stopRecognition();
    }

    accumulatedTextRef.current = text;
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    recognizer.recognizing = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
        setText(accumulatedTextRef.current + " " + e.result.text);
      }
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        if (e.result.text.trim()) {
          accumulatedTextRef.current += " " + e.result.text;
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSending) {
      handleSendClick();
    }
  };

  return (
    <div className="-mt-1 max-w-2xl font-[Poppins]">
      {isListening && (
        <div className="mb-4 bg-gray-100 text-black text-sm px-4 py-2 rounded-full shadow-sm inline-flex items-center animate-fade-in">
          <div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></div>
          <span>Microphone Active - Listening...</span>
        </div>
      )}
  
      <h2 className="text-[22px] font-semibold text-black mb-4">Search</h2>
  
      <div className="flex items-center border-b-[4px] border-black pb-4 relative w-full">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 outline-none bg-transparent text-black placeholder-black text-[16px] font-medium tracking-wide"
          maxLength={180}
          placeholder="What's your itinerary?"
          disabled={isSending}
        />
        <SendHorizontal
          className={`cursor-pointer text-black transition-opacity duration-200 ${isSending ? "opacity-50 cursor-not-allowed" : "hover:opacity-70"}`}
          size={30}
          onClick={!isSending ? handleSendClick : undefined}
        />
      </div>
  
      <div className="text-right text-black text-sm mt-1">{text.length}/180</div>
  
      <div className="flex justify-end space-x-4 mt-4 relative">
        <button
          className={`p-2 rounded-full transition-all duration-200 ${
            isListening ? "bg-gray-200" : "hover:bg-gray-100"
          } ${isSending ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={!isSending ? handleMicClick : undefined}
          disabled={isSending}
        >
          {isListening ? <Mic size={35} className="text-black" /> : <MicOff size={35} className="text-black" />}
        </button>
  
        <button 
          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          onClick={handleInfoClick}
        >
          <Info size={35} className="text-black" />
        </button>
      </div>

      {/* Info Modal */}
      {infoUrl && (
        <InfoModal
          url={infoUrl}
          onClose={() => setInfoUrl(null)}
        />
      )}
    </div>
  );
}