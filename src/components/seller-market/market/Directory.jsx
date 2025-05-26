import React from 'react';

const Directory = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Directory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Aviation Operators</h3>
          <p className="text-sm text-gray-600 mt-2">Browse certified operators</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Service Providers</h3>
          <p className="text-sm text-gray-600 mt-2">Find aviation services</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Aircraft Dealers</h3>
          <p className="text-sm text-gray-600 mt-2">Buy and sell aircraft</p>
        </div>
      </div>
    </div>
  );
};

export default Directory; 