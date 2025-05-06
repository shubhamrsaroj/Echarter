// ReviewDelete.jsx
import React, { useState } from "react";
import { Star, CircleHelp, X } from "lucide-react";
import { toast } from "react-toastify";
import SpeechInput from "./SpeechInput";

const ReviewDelete = ({ dealBuyerName, onClose, onSubmit, isSubmitting = false }) => {
  const [selectedStars, setSelectedStars] = useState([false, false, false, false, false]);
  const [feedback, setFeedback] = useState("");
  const [worked, setWorked] = useState(null);
  const [showCloseButton, setShowCloseButton] = useState(false);

  const rating = selectedStars.filter(Boolean).length;

  const handleStarClick = (index) => {
    if (isSubmitting) return;
    // If clicking first star and it's already selected, clear all stars
    if (index === 0 && selectedStars[0]) {
      setSelectedStars([false, false, false, false, false]);
    } else {
      const newSelectedStars = selectedStars.map((_, i) => i <= index);
      setSelectedStars(newSelectedStars);
    }
  };

  const handleSubmit = async () => {
    if (worked === null) {
      toast.error("Please select if it worked or not", {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }
    
    const reviewData = {
      rating,
      feedback,
      worked,
      isDecline: false,
      path: "Delete"
    };

    try {
      const response = await onSubmit(reviewData);
      
      if (response && response.success) {
        toast.success(response.message || "Review submitted successfully", {
          position: "top-right",
          autoClose: 3000
        });
        setShowCloseButton(true);
      } else {
        toast.error(response?.message || "Failed to process the request", {
          position: "top-right",
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('ReviewDelete Error:', error);
      toast.error(error?.message || "Failed to submit review", {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-md sticky top-2">
      <div className="flex justify-between items-center mb-2">
        <button onClick={onClose} disabled={isSubmitting}>
          <div className="rounded-full border border-gray-300 p-1">
            <X size={20} />
          </div>
        </button>
        <button disabled={isSubmitting}>
          <CircleHelp size={24} />
        </button>
      </div>

      <h2 className="text-2xl font-bold mt-2">Review</h2>
      <p className="text-sm mt-1 text-[#545454]">
        Take a minute to review your conversation with{" "}
        <span className="font-bold text-black">{dealBuyerName}</span>
      </p>

      <div className="mb-8 mt-6">
        <label className="block mb-2 font-medium">
          Did it Work? <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => setWorked(true)}
            className={`w-full p-3 border border-black rounded-lg ${
              worked === true ? "bg-gray-200" : ""
            }`}
            disabled={isSubmitting}
          >
            Yes
          </button>
          <button
            onClick={() => setWorked(false)}
            className={`w-full p-3 border border-black rounded-lg ${
              worked === false ? "bg-gray-200" : ""
            }`}
            disabled={isSubmitting}
          >
            No
          </button>
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
                disabled={isSubmitting}
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
        disabled={isSubmitting || worked === null}
        className={`w-full py-4 rounded-lg font-medium ${
          isSubmitting || worked === null
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

export default ReviewDelete;