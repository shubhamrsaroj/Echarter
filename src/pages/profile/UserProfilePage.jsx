import React, { useState } from "react";

// Import dashboard components
import UserProfileTopNavigation from "../../components/profile/profileNavigation/UserProfileTopNavigation";
import UserProfileContentRender from "../../components/profile/UserProfileContentRender";

const UserProfilePage = () => {
  // Dashboard state
  const [activeTab, setActiveTab] = useState('Profile');

  // Handlers for dashboard navigation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };


  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header Navigation */}
      <UserProfileTopNavigation
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <UserProfileContentRender 
          activeTab={activeTab}
        />
      </div>
    </div>
  );
};

export default UserProfilePage;