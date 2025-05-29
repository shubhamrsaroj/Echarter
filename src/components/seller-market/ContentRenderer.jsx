import React from 'react';
import Search from './market/Search';
import Directory from './market/Directory';
import Needs from './market/Needs';
import Haves from './market/Haves';
import Airports from './market/Airports';
import Profile from './company/Profile';
import Teams from './company/Teams';
import Reviews from './company/Reviews';

// Import components for other tabs as needed

const ContentRenderer = ({ activeTab, activeSubTab }) => {
  const getContent = () => {
    const key = `${activeTab}-${activeSubTab}`;
    
    const components = {
      'Market-Search': Search,
      'Market-Directory': Directory,
      'Market-Needs': Needs,
      'Market-Haves': Haves,
      'Market-Manage Haves': Haves,
      'Market-Airports': Airports,

      'Company-Profile': Profile,
      'Company-Teams': Teams,
      'Company-Reviews': Reviews
      
      // Add other components as they are implemented
    };
    
    const Component = components[key];
    
    if (Component) {
      return <Component />;
    }
    
    // Default content for other tabs
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {activeTab} - {activeSubTab}
        </h2>
        <p className="text-gray-600">
          Content for {activeTab} - {activeSubTab} will be implemented here.
        </p>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
      {getContent()}
    </div>
  );
};

export default ContentRenderer; 