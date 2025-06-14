import React, { useState, useRef } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import { Toast } from 'primereact/toast';
import Fleet from './fleet/Fleet';
import './Operators.css';

const Operators = () => {
  // State for active tab
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  // Toast reference for notifications
  const toast = useRef(null);

  // Tabs for the operator section
  const tabs = [
    { label: 'Fleet', icon: 'pi pi-plane' },
    { label: 'Pricing Profiles', icon: 'pi pi-dollar' },
    { label: 'Branding', icon: 'pi pi-palette' },
    { label: 'Settings', icon: 'pi pi-cog' }
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTabIndex) {
      case 0: // Fleet tab
        return <Fleet />;
      case 1: // Pricing Profiles tab
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Pricing Profiles</h2>
            <p className="text-gray-600">Pricing profiles management will be implemented here.</p>
          </div>
        );
      case 2: // Branding tab
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Branding</h2>
            <p className="text-gray-600">Branding management will be implemented here.</p>
          </div>
        );
      case 3: // Settings tab
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Settings</h2>
            <p className="text-gray-600">Settings management will be implemented here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toast ref={toast} />
      
      {/* Tab Menu */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-2 operators-tab-menu">
        <TabMenu
          model={tabs}
          activeIndex={activeTabIndex}
          onTabChange={(e) => setActiveTabIndex(e.index)}
          className="border-none"
        />
      </div>
      
      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default Operators; 