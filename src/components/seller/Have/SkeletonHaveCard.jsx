import React from 'react';

const SkeletonHaveCard = () => {
    return (
        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 animate-pulse mb-4 flex justify-between items-center relative">
          <div className="flex flex-col w-full">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="flex mt-2 space-x-6">
              <div className="w-1/3">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
              <div className="w-2/3">
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
export default SkeletonHaveCard;
