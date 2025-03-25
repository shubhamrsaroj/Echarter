import React from 'react';
import { CircleX, ThumbsUp, ThumbsDown } from 'lucide-react';

const ErrorPrompt = ({ error, onClose }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-gray-300 rounded-lg shadow-lg min-h-[500px]">
      {/* Main Content Section */}
      <div className="p-4">
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <CircleX size={20} />
          </button>
        </div>

        {/* Title and Subtitle */}
        <h2 className="text-black font-bold text-lg  text-start">{error?.help?.title}</h2>
        <p className="text-black text-sm mb-4 text-start">{error?.help?.subtitle}</p>

        {/* Description */}
        <p className="text-black text-sm mb-4">{error?.description}</p>

        {/* Good Example */}
        <div className="mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-10 flex items-start">
            <ThumbsUp className="text-green-600 mr-2 mt-1" size={16} />
            <p className="text-green-800 font-mono text-sm">{error?.good_example}</p>
          </div>
        </div>

        {/* Bad Example */}
        <div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-10 flex items-start">
            <ThumbsDown className="text-red-600 mr-2 mt-1" size={16} />
            <p className="text-red-600 font-mono text-sm">{error?.bad_example}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPrompt;
