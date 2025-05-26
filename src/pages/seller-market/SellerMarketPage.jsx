import React, { useState } from "react";

// Import dashboard components
import TopNavigation from "../../components/seller-market/common/navigation/TopNavigation";
import SubNavigation from "../../components/seller-market/common/navigation/SubNavigation";
import Sidebar from "../../components/seller-market/common/sidebar/Sidebar";
import ContentRenderer from "../../components/seller-market/ContentRenderer";
import { navigationConfig } from "../../components/seller-market/common/navigation/navigationConfig";

const SellerMarketPage = () => {
  // Dashboard state
  const [activeTab, setActiveTab] = useState('Market');
  const [activeSubTab, setActiveSubTab] = useState(navigationConfig.Market.defaultTab);

  // Handlers for dashboard navigation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveSubTab(navigationConfig[tab].defaultTab);
  };

  const handleSubTabChange = (subtab) => {
    setActiveSubTab(subtab);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header Navigation */}
      <TopNavigation
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      {/* Sub Navigation */}
      <SubNavigation 
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onSubTabChange={handleSubTabChange}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <ContentRenderer 
          activeTab={activeTab}
          activeSubTab={activeSubTab}
        />
      </div>
    </div>
  );
};

export default SellerMarketPage;