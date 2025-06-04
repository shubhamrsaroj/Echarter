import React, { useState } from "react";
import { TabView, TabPanel } from 'primereact/tabview';
import ContentRenderer from "../../components/seller-market/ContentRenderer";
import SellerSidebar from "../../components/seller-market/common/SellerSidebar";
import { navigationConfig } from "../../components/seller-market/common/navigation/navigationConfig";
import 'primeicons/primeicons.css';
import './SellerMarketPage.css'; // Import your updated Fluent-compatible CSS

const SellerMarketPage = () => {
  // State for tabs
  const [activeTab, setActiveTab] = useState('Market');
  const [activeSubTab, setActiveSubTab] = useState(navigationConfig.Market.defaultTab);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Top-level tab change handler
  const handleTabChange = (e) => {
    const tabName = Object.keys(navigationConfig)[e.index];
    setActiveTab(tabName);
    setActiveTabIndex(e.index);
    setActiveSubTab(navigationConfig[tabName].defaultTab);
  };

  // Subtab change handler
  const handleSubTabChange = (tabName, subtabIndex) => {
    const subtab = navigationConfig[tabName].subtabs[subtabIndex];
    setActiveSubTab(subtab);
  };

  // Sidebar toggle condition
  const hideSidebar = activeSubTab === 'Manage Haves' || activeSubTab === 'Search';

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Main TabView */}
      <div className="bg-white shadow-sm">
        <TabView 
          activeIndex={activeTabIndex} 
          onTabChange={handleTabChange}
          className="tab-no-space"
        >
          {Object.keys(navigationConfig).map((tabName) => (
            <TabPanel key={tabName} header={tabName}>
              {/* SubTabView */}
              <TabView
                activeIndex={navigationConfig[tabName].subtabs.indexOf(activeSubTab)}
                onTabChange={(e) => handleSubTabChange(tabName, e.index)}
                className="remove-panel-space tab-no-space"
              >
                {navigationConfig[tabName].subtabs.map((subtab) => (
                  <TabPanel key={subtab} header={subtab} />
                ))}
              </TabView>
            </TabPanel>
          ))}
        </TabView>
      </div>

      {/* Content + Sidebar */}
      <div className="flex flex-1 overflow-hidden bg-white">
        {!hideSidebar && <SellerSidebar activeSubTab={activeSubTab} />}
        <ContentRenderer activeTab={activeTab} activeSubTab={activeSubTab} />
      </div>
    </div>
  );
};

export default SellerMarketPage;
