import React from 'react';
import { navigationConfig } from './navigationConfig';

const SubNavigation = ({ activeTab, activeSubTab, onSubTabChange }) => {
  const subtabs = navigationConfig[activeTab]?.subtabs || [];
  
  return (
    <div className="bg-gray-50 border-b border-gray-200 sticky top-16 z-40">
      <div className="flex space-x-6 px-6 overflow-x-auto">
        {subtabs.map((subtab) => (
          <button
            key={subtab}
            onClick={() => onSubTabChange(subtab)}
            className={`py-3 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeSubTab === subtab
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {subtab}
            {activeSubTab === subtab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubNavigation; 