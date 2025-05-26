import React from 'react';
import { navigationConfig } from './navigationConfig';

const TopNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="flex space-x-8 px-6">
        {Object.entries(navigationConfig).map(([tab]) => {
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopNavigation; 