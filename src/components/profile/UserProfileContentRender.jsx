import React from 'react';
import Profile from './userProfiles/Profile';

// Import components for other tabs as needed

const UserProfileContentRender = ({ activeTab }) => {
    
    const components = {

      'Profile':Profile
      
      
      // Add other components as they are implemented
    };
    
    const Component = components[activeTab];
    
    if (Component) {
      return <Component />;
    }
  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {activeTab}
        </h2>
        <p className="text-gray-600">
          Content for {activeTab} will be implemented here.
        </p>
      </div>
    </div>
  );
}

export default UserProfileContentRender; 