import React from 'react';
import Profile from './userProfiles/Profile';
import Operators from './operators/Operators';

// Placeholder components for new tabs
const Plans = () => (
  <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Plans</h2>
      <p className="text-gray-600">Subscription plans and pricing options will be displayed here.</p>
    </div>
  </div>
);

const Account = () => (
  <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
      <p className="text-gray-600">Account settings and information will be displayed here.</p>
    </div>
  </div>
);

const UserProfileContentRender = ({ activeTab }) => {
    
    const components = {
      'Profile': Profile,
      'Plans': Plans,
      'Account': Account,
      'Operators': Operators
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