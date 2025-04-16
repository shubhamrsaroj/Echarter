// ReviewDecline.jsx
import React, { useState, useEffect } from "react";
import { Star, CircleHelp, ChevronDown, X } from "lucide-react";
import SpeechInput from "./SpeechInput"; // Import the reusable component
import { getInfoContent } from "../../../api/infoService";

const ReviewDecline = ({ dealBuyerName, onClose, onSubmit, isSubmitting = false }) => {
  const [selectedStars, setSelectedStars] = useState([false, false, false, false, false]);
  const [feedback, setFeedback] = useState("");
  const [reason, setReason] = useState("");
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [error, setError] = useState(null);
  const [reasonOptions, setReasonOptions] = useState([]);

  const rating = selectedStars.filter(Boolean).length;

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const data = await getInfoContent('decline', 'dropdown');
        if (data && data.text) {
          setReasonOptions([{ value: 'decline', text: data.text }]);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchReasons();
  }, []);

  const handleStarClick = (index) => {
    if (isSubmitting) return;
    const newSelectedStars = [...selectedStars];
    newSelectedStars[index] = !newSelectedStars[index];
    setSelectedStars(newSelectedStars);
  };

  const handleSubmit = () => {
    if (!reason) {
      alert("Please select a reason for declining");
      return;
    }
    onSubmit({ rating, feedback, reason });
    setShowCloseButton(true);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-md sticky top-2">
      <div className="flex justify-between items-center mb-2">
        <button onClick={onClose} disabled={isSubmitting}>
          <div className="rounded-full border border-gray-300 p-1">
            <X size={20} />
          </div>
        </button>
        <CircleHelp size={24} className="text-gray-300" />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <h2 className="text-2xl font-bold mt-2">Review</h2>
      <p className="text-sm mt-1 text-[#545454]">
        Take a minute to review your conversation with{" "}
        <span className="font-bold text-black">{dealBuyerName}</span>
      </p>

      <div className="mb-8 mt-6">
        <label className="block mb-2 font-medium">
          Choose your Reason to Decline? <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 border border-black rounded-lg pr-10 appearance-none"
            required
            disabled={isSubmitting}
          >
            <option value="">Select a reason</option>
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown size={22} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#111111]">Your Rating</span>
          <div className="flex">
            {selectedStars.map((isSelected, index) => (
              <Star
                key={index}
                size={26}
                fill={isSelected ? "#ffce00" : "none"}
                stroke="#ffce00"
                className="cursor-pointer"
                onClick={() => handleStarClick(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block mb-2">
          Your Feedback for <span className="font-bold text-black">{dealBuyerName}</span>
        </label>
        <SpeechInput
          value={feedback}
          onChange={setFeedback}
          disabled={isSubmitting}
          placeholder="Type your feedback here..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !reason}
        className={`w-full py-4 rounded-lg font-medium ${
          isSubmitting || !reason
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-black text-white"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit and Delete"}
      </button>

      {showCloseButton && (
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg font-medium"
        >
          Close
        </button>
      )}
    </div>
  );
};

export default ReviewDecline;