import React, { useState } from "react";
import { Star, CircleHelp, X } from "lucide-react";
import SpeechInput from "../../seller/Review/SpeechInput";

const ReviewDelete = ({ dealSellerName, conversationId, onClose, onSubmit, isSubmitting = false }) => {
  const [selectedStars, setSelectedStars] = useState([false, false, false, false, false]);
  const [feedback, setFeedback] = useState("");
  const [worked, setWorked] = useState(null);

  const rating = selectedStars.filter(Boolean).length;

  const handleStarClick = (index) => {
    if (isSubmitting) return;
    const newSelectedStars = [...selectedStars];
    newSelectedStars[index] = !newSelectedStars[index];
    setSelectedStars(newSelectedStars);
  };

  const handleSubmit = () => {
    if (worked === null) {
      alert("Please select if it worked or not");
      return;
    }
    onSubmit({ rating, feedback, worked, conversationId });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-md max-h-[calc(100vh-80px)]">
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

      <div className="mt-2">
        <h2 className="text-2xl font-bold mb-2">Review</h2>
        <p className="text-sm mb-4 text-[#545454]">
          Take a minute to review your conversation with{" "}
          <span className="font-bold text-black">{dealSellerName}</span>
        </p>

        <div className="mb-6">
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

        <div className="mb-6">
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

        <div className="mb-6">
          <label className="block mb-2">
            Your Feedback for <span className="font-bold text-black">{dealSellerName}</span>
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
          className={`w-full py-3 rounded-lg font-medium ${
            isSubmitting || worked === null
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit and Delete"}
        </button>
      </div>
    </div>
  );
};

export default ReviewDelete; 