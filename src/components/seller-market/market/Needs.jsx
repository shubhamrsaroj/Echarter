import React from 'react';

const Needs = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Needs</h2>
      <div className="space-y-4">
        <div className="border-l-4 border-orange-400 pl-4">
          <h3 className="font-medium text-gray-900">Charter Requests</h3>
          <p className="text-sm text-gray-600">Active charter flight requests from customers</p>
        </div>
        <div className="border-l-4 border-blue-400 pl-4">
          <h3 className="font-medium text-gray-900">Aircraft Requirements</h3>
          <p className="text-sm text-gray-600">Specific aircraft needed for operations</p>
        </div>
        <div className="border-l-4 border-green-400 pl-4">
          <h3 className="font-medium text-gray-900">Service Demands</h3>
          <p className="text-sm text-gray-600">Aviation services in high demand</p>
        </div>
      </div>
    </div>
  );
};

export default Needs; 