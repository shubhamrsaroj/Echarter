import React from 'react';
import { CircleX, ThumbsUp, ThumbsDown } from 'lucide-react'; 

const ErrorPrompt = ({ error, onClose }) => {
  const errorDetails = error || {};

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

        {/* Message (Centered) */}
        <h2 className="text-black font-bold text-lg mb-2 text-center">
          {errorDetails.message || 'Looks like this is not a valid itinerary'}
        </h2>

        {/* Description */}
        <p className="text-black text-sm mb-4">
          {errorDetails.description ||
            'To avoid confusion, please provide at least the following information in your Prompt in English Language. I am still learning other languages - Common City names such as NewYork or London is good. Do not enter less known codes such as IATA codes or ICAO codes. - Dates should include the day, month and year. 9/9/24 is confusing because I do not track your location. - If its a return trip just type return followed by return date. - If you have specific requirements such as pets or wheelchair please mention that.'}
        </p>

        {/* Good Example */}
        <div className="mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-10 flex items-start">
            <ThumbsUp className="text-green-600 mr-2 mt-1" size={16} />
            <p className="text-green-800 font-mono text-sm">
              {errorDetails.good_example ||
                'Newyork to Miami on 12 Jan 2025, 6 Pax, return on 14 Jan 2025. We have a Pet'}
            </p>
          </div>
        </div>

        {/* Bad Example */}
        <div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-10 flex items-start">
            <ThumbsDown className="text-red-600 mr-2 mt-1" size={16} />
            <p className="text-red-600 font-mono text-sm">
              {errorDetails.bad_example || 'KTEB - KMIA, 1,12 3 Pax KMIA - KTEB 1,14 Midsize'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPrompt;