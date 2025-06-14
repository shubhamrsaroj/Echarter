import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import FleetForm from './FleetForm';

const FleetSidebar = ({ isOpen, onClose, fleetItem, onSave, mode = 'add' }) => {
  // Create a wrapper for onSave that handles the shouldClose parameter
  const handleSave = (fleetData, shouldClose = true) => {
    // Call the parent's onSave function with the fleet data and shouldClose parameter
    onSave(fleetData, shouldClose);
    
    // Only close the sidebar if shouldClose is true
    if (shouldClose) {
      onClose();
    }
  };
  
  return (
    <Sidebar
      visible={isOpen}
      position="right"
      onHide={onClose}
      className="w-2/5 p-0"
      showCloseIcon={false}
      blockScroll
    >
      <div className="h-full flex flex-col p-6 bg-white">
        <FleetForm 
          fleetItem={fleetItem} 
          onSave={handleSave} 
          onCancel={onClose}
          mode={mode} 
        />
      </div>
    </Sidebar>
  );
};

export default FleetSidebar; 