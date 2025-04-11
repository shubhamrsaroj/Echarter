import React from "react";
import { List } from "lucide-react";

const SkeletonActivityCard = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full w-full">
      {/* Left half of the page */}
      <div className="w-full lg:w-1/2 px-4 lg:px-6 py-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <List className="text-2xl cursor-pointer text-gray-300" size={24} />
        </div>

        {[1, 2, 3].map((item) => (
          <div key={item} className="border border-black rounded-lg p-4 lg:p-6 bg-white w-full mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
              <div className="w-full sm:w-auto">
                <div className="h-7 bg-gray-200 rounded w-48 mb-1 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-64 mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>

              <div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-end">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mt-1 animate-pulse"></div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mt-1 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="flex mt-6 gap-5">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Right half of the page */}
      <div className="w-full lg:w-1/2 px-4 lg:px-6 py-4"></div>
    </div>
  );
};

export default SkeletonActivityCard; 