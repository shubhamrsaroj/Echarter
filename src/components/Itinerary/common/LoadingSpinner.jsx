import React from 'react';

const LoadingSpinner = ({ 
  cardCount = 4, 
  showHeader = true,
  minCardHeight = 220,
  animationSpeed = 'normal' 
}) => {
  // Animation speed variants
  const animationVariants = {
    slow: 'animate-[pulse_3s_ease-in-out_infinite]',
    normal: 'animate-pulse',
    fast: 'animate-[pulse_1s_ease-in-out_infinite]'
  };
  
  const animation = animationVariants[animationSpeed] || animationVariants.normal;
  
  // Generate a slightly random width for skeleton elements to add variety
  const randomWidth = () => {
    const widths = ['w-1/2', 'w-2/3', 'w-3/4', 'w-4/5'];
    return widths[Math.floor(Math.random() * widths.length)];
  };

  return (
    <div className="w-full">
      {/* Header skeleton - only shown if showHeader is true */}
      {showHeader && (
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <div className={`h-8 bg-gray-200 rounded-md w-64 ${animation}`}></div>
          <div className={`h-8 bg-gray-200 rounded-md w-48 ${animation}`}></div>
        </div>
      )}
      
      {/* One card per row layout */}
      <div className="space-y-6">
        {[...Array(cardCount)].map((_, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 w-full transition-all hover:shadow-md"
            style={{ minHeight: `${minCardHeight}px` }}
          >
            {/* Company header skeleton */}
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full bg-gray-200 ${animation} mr-4`}></div>
              <div className="flex-1">
                <div className={`h-5 bg-gray-200 rounded ${randomWidth()} mb-2 ${animation}`}></div>
                <div className={`h-4 bg-gray-200 rounded w-1/2 ${animation}`}></div>
              </div>
              <div className={`h-8 w-24 bg-gray-200 rounded-md ${animation}`}></div>
            </div>
            
            {/* Extended content area for single-row card */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Aircraft section skeleton */}
              <div className="bg-gray-50 p-4 rounded-lg flex-1">
                <div className={`h-5 bg-gray-200 rounded ${randomWidth()} ${animation}`}></div>
                <div className="mt-4 space-y-3">
                  <div className={`h-4 bg-gray-200 rounded w-3/4 ${animation}`}></div>
                  <div className={`h-4 bg-gray-200 rounded w-1/2 ${animation}`}></div>
                  <div className={`h-4 bg-gray-200 rounded w-2/3 ${animation}`}></div>
                </div>
              </div>
              
              {/* Price and details section */}
              <div className="flex flex-col justify-between md:w-1/4">
                <div>
                  <div className={`h-4 bg-gray-200 rounded w-full mb-2 ${animation}`}></div>
                  <div className={`h-6 bg-gray-200 rounded w-3/4 mb-4 ${animation}`}></div>
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <div className={`h-10 w-full bg-gray-200 rounded-md ${animation}`}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;