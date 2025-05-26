import React from 'react';

const Haves = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Haves</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Available Aircraft</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Light Jets</span>
              <span className="text-sm font-medium text-green-600">12 Available</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Mid-size Jets</span>
              <span className="text-sm font-medium text-green-600">8 Available</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Heavy Jets</span>
              <span className="text-sm font-medium text-green-600">5 Available</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Available Services</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Maintenance</span>
              <span className="text-sm font-medium text-blue-600">15 Providers</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Ground Handling</span>
              <span className="text-sm font-medium text-blue-600">22 Providers</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Catering</span>
              <span className="text-sm font-medium text-blue-600">18 Providers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Haves; 