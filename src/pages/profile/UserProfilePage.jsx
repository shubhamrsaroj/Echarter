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
    <div>
    <div className="p-2">
        <ArrowLeft onClick={handleBack}/>
      </div>
    <div className="h-screen flex flex-col bg-gray-100">
       
      {/* Header Navigation */}
      <UserProfileTopNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <UserProfileContentRender activeTab={activeTab} />
      </div>
    </div>
    </div>
  );
};

export default UserProfilePage;
