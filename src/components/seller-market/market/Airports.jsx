import React from 'react';

const Airports = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Airports</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">John F. Kennedy International (JFK)</h3>
            <p className="text-sm text-gray-600">New York, NY - Major International Hub</p>
          </div>
          <span className="text-sm text-green-600 font-medium">Active</span>
        </div>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Los Angeles International (LAX)</h3>
            <p className="text-sm text-gray-600">Los Angeles, CA - West Coast Hub</p>
          </div>
          <span className="text-sm text-green-600 font-medium">Active</span>
        </div>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Chicago O'Hare International (ORD)</h3>
            <p className="text-sm text-gray-600">Chicago, IL - Central Hub</p>
          </div>
          <span className="text-sm text-green-600 font-medium">Active</span>
        </div>
      </div>
    </div>
  );
};

export default Airports; 