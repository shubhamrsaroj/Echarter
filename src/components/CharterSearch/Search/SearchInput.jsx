import { useState, useEffect, useRef, useCallback } from "react";
import { SendHorizontal, Mic, MicOff, Info, History } from "lucide-react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { useLocation } from "react-router-dom";
import InfoModal from "../../common/InfoModal";
import { getInfoContent } from "../../../api/infoService";
import { toast } from "react-toastify";

// Storage key for input text
const INPUT_STORAGE_KEY = "itinerary_input_text";
const SESSION_STORAGE_KEY = "itinerary_session_data";

// Function to check if a path is within the Search context
const isItineraryPath = (path) => {
  // List of paths that should be considered part of the Search context
  const itineraryPaths = [
    "/search", 
    "/search-details",
    "/search/base-details",
    "/search/match-details",
    "/search/date-adjustment-details",
    "/search/broker-details"
  ];
  
  // Check if current path starts with any of these paths
  return itineraryPaths.some(itineraryPath => path.startsWith(itineraryPath));
};

export default function SearchInput({ onSearch, showRecentSearches, onToggleRecentSearches }) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [infoUrl, setInfoUrl] = useState(null);
  const recognizerRef = useRef(null);
  const timeoutRef = useRef(null);
  const accumulatedTextRef = useRef("");
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const textareaRef = useRef(null);

  const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechRecognitionLanguage = "en-US";

  // Save session data to localStorage and sessionStorage for persistence
  const saveTextToStorage = useCallback((textValue) => {
    if (textValue) {
      localStorage.setItem(INPUT_STORAGE_KEY, textValue);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        text: textValue,
        timestamp: Date.now(),
        path: location.pathname
      }));
    }
  }, [location.pathname]);

  // Initialize text from storage or navigation state when component mounts
  useEffect(() => {
    // Priority to navigation state
    const copiedText = location.state?.copiedText;
    if (copiedText) {
      setText(copiedText);
      saveTextToStorage(copiedText);
      return;
    }

    // If we're in itinerary context, try to get from storage
    if (isItineraryPath(location.pathname)) {
      // Try session storage first (more reliable for navigation)
      const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionData) {
        try {
          const { text: savedText } = JSON.parse(sessionData);
          if (savedText) {
            setText(savedText);
            return;
          }
        } catch (e) {
          console.error("Failed to parse session data:", e);
        }
      }

      // Fall back to localStorage
      const savedText = localStorage.getItem(INPUT_STORAGE_KEY);
      if (savedText) {
        setText(savedText);
      }
    } else {
      // If not in itinerary context, don't clear storage here - we'll only
      // clear on page refresh or when explicitly leaving itinerary context
    }
  }, [location.pathname, location.state, saveTextToStorage]);

  // Track navigation and update/clear storage accordingly
  useEffect(() => {
    const currentPath = location.pathname;
    const wasInItinerary = isItineraryPath(prevPathRef.current);
    const isInItinerary = isItineraryPath(currentPath);
    
    // Update path reference
    prevPathRef.current = currentPath;
    
    if (wasInItinerary && isInItinerary) {
      // Staying within itinerary context - make sure text is saved
      if (text) {
        saveTextToStorage(text);
      }
    } 
    else if (wasInItinerary && !isInItinerary) {
      // Leaving itinerary context - clear text from UI but keep in storage
      // (only refresh or beforeunload should clear storage)
      setText("");
    }
    else if (!wasInItinerary && isInItinerary) {
      // Coming to itinerary from elsewhere - try to restore
      const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionData) {
        try {
          const { text: savedText } = JSON.parse(sessionData);
          if (savedText) {
            setText(savedText);
            return;
          }
        } catch (e) {
          console.error("Failed to parse session data:", e);
        }
      }

      const savedText = localStorage.getItem(INPUT_STORAGE_KEY);
      if (savedText) {
        setText(savedText);
      }
    }
  }, [location.pathname, text, saveTextToStorage]);

  // Save text to storage when it changes (but only in itinerary context)
  useEffect(() => {
    if (text && isItineraryPath(location.pathname)) {
      saveTextToStorage(text);
    }
  }, [location.pathname, text, saveTextToStorage]);

  // Listen for beforeunload event to clear localStorage
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem(INPUT_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Listen for copiedText changes and update input if it changes
  useEffect(() => {
    if (location.state?.copiedText) {
      setText(location.state.copiedText);
      saveTextToStorage(location.state.copiedText);
      // Optionally clear copiedText from state to prevent repeated updates
      window.history.replaceState(
        { ...window.history.state, usr: { ...window.history.state?.usr, copiedText: undefined } },
        ''
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.copiedText]);

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
        const newText = accumulatedTextRef.current + " " + e.result.text;
        setText(newText);
        if (isItineraryPath(location.pathname)) {
          saveTextToStorage(newText);
        }
      }
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        if (e.result.text.trim()) {
          accumulatedTextRef.current += " " + e.result.text;
          const newText = accumulatedTextRef.current.trim();
          setText(newText);
          if (isItineraryPath(location.pathname)) {
            saveTextToStorage(newText);
          }
        }
      }
    };

    recognizer.sessionStarted = () => {
      setIsListening(true);
      timeoutRef.current = setTimeout(() => {
        stopRecognition();
      }, 15000);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSending) {
      handleSendClick();
    }
  };

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to properly calculate new height
      textareaRef.current.style.height = "auto";
      // Set height to scrollHeight to fit all content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="-mt-1 max-w-2xl font-[Poppins]">
      {isListening && (
        <div className="mb-4 bg-gray-100 text-black text-sm px-4 py-2 rounded-full shadow-sm inline-flex items-center animate-fade-in">
          <div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></div>
          <span>Microphone Active - Listening...</span>
        </div>
      )}
  
      <h2 className="text-3xl font-bold text-black mb-6 items-start">Charter Search</h2>
  
      <div className="flex items-start border-b-[4px] border-black pb-4 relative w-full">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none bg-transparent text-black placeholder-black text-[16px] font-medium tracking-wide resize-none overflow-visible min-h-[24px] w-full"
          maxLength={180}
          placeholder="What's your itinerary?"
          disabled={isSending}
          rows={1}
        />
        <SendHorizontal
          className={`cursor-pointer text-black transition-opacity duration-200 flex-shrink-0 ${isSending ? "opacity-50 cursor-not-allowed" : "hover:opacity-70"}`}
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
          className={`p-2 rounded-full hover:bg-gray-100 transition-all duration-200 ${!showRecentSearches ? 'animate-pulse' : ''}`}
          onClick={onToggleRecentSearches}
        >
          <History size={35} className="text-black" />
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