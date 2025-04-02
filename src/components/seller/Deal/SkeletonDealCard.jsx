import React from "react";

const SkeletonDealCard = () => {
  return (
    <div className="flex flex-col w-full max-w-lg mt-6">
      <div className="flex items-center space-x-1 text-2xl font-bold pb-2">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-6 w-6 bg-gray-200 rounded-full ml-4 animate-pulse"></div>
      </div>
      
      {[1, 2, 3].map((item) => (
        <div key={item} className="border border-gray-200 rounded-lg relative p-4 bg-white mb-4">
          <div className="absolute -right-1 -top-1">
            <div className="w-8 h-12 bg-gray-200 rounded-sm animate-pulse"></div>
          </div>
          
          <div className="pb-4">
            <div className="h-6 bg-gray-200 rounded w-40 mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-56 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              {[1, 2, 3, 4].map((icon) => (
                <div key={icon} className="p-2">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-6 items-start -translate-y-8 -translate-x-4">
              {[1, 2].map((btn) => (
                <div key={btn} className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonDealCard;