import React from 'react';

const UserDetailsGridLoader = () => {
  return (
    <div className="w-full p-4">
      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row w-full gap-4">
        {/* Left column */}
        <div className="w-full md:w-1/2 space-y-3">
          {/* Personal Information Loader */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full animate-pulse">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </div>
            <div className="flex p-5">
              <div className="mr-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-grow">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start">
                    <div className="mr-2 w-5 h-5 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-5 bg-gray-300 rounded w-36"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phone Number Loader */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full animate-pulse">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </div>
            <div className="p-5 space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                  <div className="h-5 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Address Loader */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full animate-pulse">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </div>
            <div className="p-5 space-y-2">
              <div className="h-5 bg-gray-300 rounded w-full"></div>
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
              <div className="h-5 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Right column - Company Details Loader */}
        <div className="w-full md:w-1/2 h-full">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full animate-pulse">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </div>
            <div className="p-5 space-y-3">
              <div className="h-7 bg-gray-300 rounded w-1/3"></div>
              <div className="h-5 bg-gray-300 rounded w-2/3"></div>
              <div className="h-5 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsGridLoader;