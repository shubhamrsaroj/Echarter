

import React from 'react';
import { CircleX, ThumbsUp, ThumbsDown } from 'lucide-react';

const ErrorPrompt = ({ error, onClose }) => {
  if (!error) return null;
  
  // Handle simple error messages (like in the first image)
  const simpleErrorMessage = typeof error === 'string' 
    ? error 
    : error.message || "An error occurred";

  // Check if we have a structured error (like in the second image)
  const hasStructuredError = error?.help && (error.help.title || error.help.subtitle);
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-gray-300 rounded-lg shadow-lg min-h-[200px]">
      <div className="p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <CircleX size={24} />
        </button>
        
        {hasStructuredError ? (
          // Structured error format (second image)
          <>
            <h2 className="text-black font-bold text-xl mb-2 text-start">
              {error.help?.title || 'Error'}
            </h2>
            <p className="text-black text-base mb-4 text-start">
              {error.help?.subtitle || ''}
            </p>
            <p className="text-black text-base mb-4">
              {error.description || ''}
            </p>
            
            {error.good_example && (
              <div className="mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                  <ThumbsUp className="text-green-600 mr-2 mt-1" size={20} />
                  <p className="text-green-800 font-mono text-base">{error.good_example}</p>
                </div>
              </div>
            )}
            
            {error.bad_example && (
              <div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <ThumbsDown className="text-red-600 mr-2 mt-1" size={20} />
                  <p className="text-red-600 font-mono text-base">{error.bad_example}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          // Simple error format (first image)
          <div>
            <h2 className="text-black font-bold text-xl mb-2 text-start">Error</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-base">{simpleErrorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPrompt;