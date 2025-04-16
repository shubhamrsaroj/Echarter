import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader, Info } from 'lucide-react';

const InfoModal = ({ url, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
  }, [url]);

  if (!url) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] relative flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center">
            <Info className="text-gray-500 mr-2" size={24} />
          </h2>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium transition-colors p-2 rounded-full hover:bg-gray-50"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline text-gray-500">Open in new tab</span>
            </a>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-gray-500 hover:text-gray-700 hover:shadow-md"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden relative px-4 pb-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <div className="flex flex-col items-center">
                <Loader className="w-8 h-8 text-gray-500 animate-spin" />
                <p className="mt-2 text-sm text-gray-500">Loading content...</p>
              </div>
            </div>
          )}
          <div className="w-full h-full overflow-auto rounded-lg">
            <iframe
              src={url}
              className="w-full h-full border-0 rounded-lg"
              title="Info Content"
              style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;