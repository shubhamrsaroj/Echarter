import React from "react";

const SkeletonDealCard = () => {
  return (
    <div className="flex flex-col md:flex-row w-full -mt-4">
      {/* Left Side: Deal List */}
      <div className="w-full md:w-1/2 p-4">
        <div className="flex items-center space-x-1 text-2xl font-bold pb-2 text-black">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-6 w-6 bg-gray-200 rounded-full ml-4 animate-pulse"></div>
        </div>
        
        {[1, 2, 3].map((item) => (
          <div key={item} className="border border-black rounded-lg relative p-4 bg-white mb-4 overflow-hidden">
            {/* Ribbon Icon */}
            <div className="absolute -right-1 -top-10">
              <div className="w-22 h-28 bg-gray-200 rounded-sm animate-pulse"></div>
            </div>
            
            <div className="pb-4">
              {/* Buyer Name */}
              <div className="h-6 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
              {/* Itinerary From/To */}
              <div className="h-4 bg-gray-200 rounded w-56 mt-2 animate-pulse"></div>
              {/* Message */}
              <div className="h-4 bg-gray-200 rounded w-full max-w-md mt-2 animate-pulse"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative">
              {/* Action Icons */}
              <div className="flex space-x-3">
                {[1, 2, 3, 4].map((icon) => (
                  <div key={icon} className="p-2">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              {/* Chat and Decline Buttons */}
              <div className="flex items-center space-x-4 mt-2 sm:mt-0 sm:absolute sm:right-12 sm:-top-20">
                <div className="flex items-center space-x-5">
                  {/* Open/Initiate Chat Button */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                  
                  {/* Decline Button */}
                  <div className="flex flex-col items-center w-12 min-w-[48px]">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Right Side: Placeholder for Itinerary/Review/Chat */}
      <div className="w-full md:w-1/2 p-4 mt-4 md:mt-8">
        <div className="h-[calc(100vh-12rem)] bg-gray-100 rounded-lg animate-pulse opacity-40"></div>
      </div>
    </div>
  );
};

export default SkeletonDealCard;