import React, { useState } from "react";
import { Trophy, Trash2,  Calendar, Clipboard, MessageCircle, ThumbsDown } from "lucide-react";

const DealCard = () => {
  // State to toggle between "Initiate" and "Open"
  const [isInitiated, setIsInitiated] = useState(false);

  // Handler for the Initiate/Open button click
  const handleInitiateClick = () => {
    setIsInitiated(true);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mt-6">
      {/* Header */}
      <div className="text-2xl font-bold pb-2">Your Deals</div>

      {/* Card Container */}
      <div className="border border-gray-200 rounded-lg relative p-4 bg-white">
        {/* Ribbon */}
        <div className="absolute -right-1 -top-1">
          <div className="w-8 h-12 bg-yellow-500 rounded-sm"></div>
        </div>

        {/* Deal Information */}
        <div className="pb-4">
          <div className="text-xl font-semibold">Firoj Ahmad</div>
          <div className="text-gray-600">Washington to Dallas</div>
          <div className="text-gray-600">8 PM on his Clock</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          {/* Left-side Icons */}
          <div className="flex space-x-3">
            <div className="p-2">
              <Trash2 size={20} className="text-gray-500" />
            </div>
            <div className="p-2">
              <Trophy size={20} className="text-gray-500" />
            </div>
            <div className="p-2">
              <Calendar size={20} className="text-gray-500" />
            </div>
            <div className="p-2">
              <Clipboard size={20} className="text-gray-500" />
            </div>
          </div>

          {/* Right-side Buttons */}
          <div className="flex space-x-3 items-start">
            {/* Initiate/Open Button */}
            <div className="flex flex-col items-center -mt-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 cursor-pointer ${
                  isInitiated ? "bg-green-200" : "bg-yellow-400"
                }`}
                onClick={handleInitiateClick}
              >
                <MessageCircle
                  size={18}
                  className={isInitiated ? "text-green-700" : "text-black"}
                />
              </div>
              <div className="text-xs">{isInitiated ? "Open" : "Initiate"}</div>
            </div>

            {/* Decline Button - Shifted slightly up */}
            <div className="flex flex-col items-center -mt-2">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-1">
                <ThumbsDown size={18} className="text-white" />
              </div>
              <div className="text-xs">Decline</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealCard;