import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import dashboard components
import UserProfileTopNavigation from "../../components/profile/profileNavigation/UserProfileTopNavigation";
import UserProfileContentRender from "../../components/profile/UserProfileContentRender";
import { ArrowLeft } from "lucide-react";

const UserProfilePage = () => {
  // Dashboard state
  const [activeTab, setActiveTab] = useState("Profile");
  const navigate = useNavigate();

  // Handlers for dashboard navigation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handler to go back
  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="p-3 flex items-center">
        <button 
          onClick={handleBack} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="container mx-auto px-4 pb-8">
        {/* Header Navigation */}
        <UserProfileTopNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Main Content Area */}
        <div className="mt-4">
          <UserProfileContentRender activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
