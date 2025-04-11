import React from "react";

const SkeletonNeedCard = () => {
  return (
    <div className="w-full md:w-1/2 p-4">
      <div className="flex items-center space-x-1 text-2xl font-bold pb-2">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-6 w-6 bg-gray-200 rounded-full ml-4 animate-pulse"></div>
      </div>
      
      {[1, 2, 3].map((item) => (
        <div key={item} className="border border-black rounded-lg relative p-4 bg-white mb-4 overflow-hidden">
          {/* Ribbon Icon Skeleton */}
          <div className="absolute -right-6 -top-10">
            <div className="w-22 h-28 bg-gray-200 animate-pulse"></div>
          </div>
          
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-16">
              <div className="h-6 bg-gray-200 rounded w-40 mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-56 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            </div>
            
            <div className="flex flex-col items-center mr-12">
              <div className="w-12 h-12 bg-gray-200 rounded-full mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonNeedCard; 