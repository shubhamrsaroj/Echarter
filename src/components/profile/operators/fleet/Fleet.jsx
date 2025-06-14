import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import FleetList from './FleetList';
import FleetSidebar from './FleetSidebar';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import axios from 'axios';
import { tokenHandler } from '../../../../utils/tokenHandler';

const Fleet = () => {
  // State for fleet data
  const [fleetData, setFleetData] = useState([]);
  
  // State for sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for selected fleet item
  const [selectedFleetItem, setSelectedFleetItem] = useState(null);
  
  // State for sidebar mode (add/edit/view)
  const [sidebarMode, setSidebarMode] = useState('add');
  
  // State for tracking frequently edited rows
  const [frequentlyEdited, setFrequentlyEdited] = useState({});
  
  // State for forcing refreshes
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Toast reference for notifications
  const toast = useRef(null);

  // Load sample data on component mount
  useEffect(() => {
    // Sample data - in a real app, this would come from an API
    const sampleData = [
      { id: 1, registration: 'N12345', type: 'Jet', location: 'New York', currency: 'USD', perHour: '5000', taxyTime: '30', na: false, editCount: 0 },
      { id: 2, registration: 'G-ABCD', type: 'Helicopter', location: 'London', currency: 'GBP', perHour: '4000', taxyTime: '15', na: true, editCount: 0 },
      { id: 3, registration: 'F-WXYZ', type: 'Turboprop', location: 'Paris', currency: 'EUR', perHour: '3500', taxyTime: '20', na: false, editCount: 0 }
    ];
    
    setFleetData(sampleData);
  }, []);

  // Handle adding a new fleet item
  const handleAddFleet = () => {
    setSelectedFleetItem(null);
    setSidebarMode('add');
    setSidebarOpen(true);
  };

  // Handle editing a fleet item
  const handleEditFleet = (fleetItem) => {
    // Show loading state
    toast.current.show({ 
      severity: 'info', 
      summary: 'Loading', 
      detail: 'Fetching aircraft details...', 
      life: 3000 
    });
    
    // First fetch complete tail details using the API
    const tailId = fleetItem.id;
    
    axios.get(
      `https://instacharterapp-server-cgfqgug5f2fsaeag.centralus-01.azurewebsites.net/api/SinglePoint/GetTailDetailsById?Id=${tailId}`,
      {
        headers: {
          'accept': 'text/plain',
          'Authorization': tokenHandler.getToken() ? `Bearer ${tokenHandler.getToken()}` : '',
          'X-Api-Key': 'instacharter@2025'
        }
      }
    )
    .then(response => {
      if (response.data && response.data.success) {
        console.log('Fetched tail details:', response.data.data);
        
        // Map the API response to the format expected by the form
        const tailDetails = response.data.data;
        
        // Create a complete fleetItem with all details from API
        const completeFleetItem = {
          ...fleetItem,
          id: tailDetails.id,
          registration: tailDetails.sl_No,
          tail: tailDetails.sl_No,
          type: tailDetails.aircraft_Type_Name,
          aircraft_Type_Name: tailDetails.aircraft_Type_Name,
          location: tailDetails.base,
          base: tailDetails.base,
          currency: tailDetails.currency,
          perHour: tailDetails.rate,
          rate: tailDetails.rate,
          taxyTime: tailDetails.taxy_Time,
          na: tailDetails.block,
          blocked: tailDetails.block,
          yom: tailDetails.yom,
          yor: tailDetails.yor,
          seats: tailDetails.tail_Max_Pax,
          tail_Max_Pax: tailDetails.tail_Max_Pax,
          mtow: tailDetails.mtoWkg,
          modeS: tailDetails.mode_S,
          baseLat: tailDetails.latitude,
          baseLong: tailDetails.longitude,
          airworthinessDate: new Date(tailDetails.airworthinessValidity),
          insuranceDate: new Date(tailDetails.insuranceValidity),
          images: tailDetails.images,
          exteriorImage: tailDetails.images && tailDetails.images.length > 0 ? tailDetails.images[0] : '',
          otherImages: tailDetails.images && tailDetails.images.length > 1 ? tailDetails.images.slice(1) : [],
          roles: tailDetails.other_Tags ? tailDetails.other_Tags.split(',').map(tag => ({ text: tag.trim() })) : [],
          amenities: tailDetails.amenities || [],
          // Include any documents
          documents: [
            ...(tailDetails.privateFiles || []).map(file => ({ 
              url: file.url, 
              name: file.name || file.url.split('/').pop(), 
              type: file.docType || 'document',
              status: 'saved'
            })),
            ...(tailDetails.publicFiles || []).map(file => ({ 
              url: file.url, 
              name: file.name || file.url.split('/').pop(), 
              type: file.docType || 'document',
              status: 'saved'
            }))
          ],
          // Store the original API response for reference
          originalApiData: tailDetails
        };
        
        // Set the selected fleet item with complete details
        setSelectedFleetItem(completeFleetItem);
        setSidebarMode('edit');
        setSidebarOpen(true);
        
        // Track edit count for frequently edited detection
        const updatedFleetData = fleetData.map(item => {
          if (item.id === fleetItem.id) {
            return { ...item, editCount: (item.editCount || 0) + 1 };
          }
          return item;
        });
        
        setFleetData(updatedFleetData);
        
        // If edit count reaches threshold, mark as frequently edited
        const updatedItem = updatedFleetData.find(item => item.id === fleetItem.id);
        if (updatedItem && updatedItem.editCount >= 3) {
          const newFrequentlyEdited = { ...frequentlyEdited };
          newFrequentlyEdited[fleetItem.id] = true;
          setFrequentlyEdited(newFrequentlyEdited);
        }
      } else {
        console.error('API Error:', response.data?.message || 'Unknown error');
        toast.current.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to fetch aircraft details', 
          life: 3000 
        });
        
        // Fallback to using the basic fleet item data
        setSelectedFleetItem(fleetItem);
        setSidebarMode('edit');
        setSidebarOpen(true);
      }
    })
    .catch(error => {
      console.error('API Error:', error);
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to fetch aircraft details', 
        life: 3000 
      });
      
      // Fallback to using the basic fleet item data
      setSelectedFleetItem(fleetItem);
      setSidebarMode('edit');
      setSidebarOpen(true);
    });
  };

  // Handle viewing a fleet item
  const handleViewFleet = (fleetItem) => {
    setSelectedFleetItem(fleetItem);
    setSidebarMode('view');
    setSidebarOpen(true);
  };

  // Handle deleting a fleet item
  const handleDeleteFleet = (fleetItem) => {
    console.log('Parent component received delete notification for:', fleetItem);
    
    if (!fleetItem || !fleetItem.id) {
      console.error('Cannot delete fleet item: Missing ID');
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Cannot delete fleet item: Missing ID', 
        life: 3000 
      });
      return;
    }
    
    // Update the local state by filtering out the deleted item
    const updatedFleetData = fleetData.filter(item => item.id !== fleetItem.id);
    
    // Log the before and after counts to verify the item was removed
    console.log(`Fleet data before: ${fleetData.length}, after: ${updatedFleetData.length}`);
    
    // Only update state if the item was actually removed
    if (updatedFleetData.length < fleetData.length) {
      setFleetData(updatedFleetData);
      
      // Force a refresh of the component
      setRefreshTrigger(prev => prev + 1);
      
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Fleet item deleted', 
        life: 3000 
      });
    } else {
      console.warn('Item not found in fleet data:', fleetItem.id);
    }
  };

  // Handle saving a fleet item
  const handleSaveFleet = (fleetItem, shouldClose = true) => {
    if (sidebarMode === 'add') {
      // Add new fleet item
      setFleetData([...fleetData, fleetItem]);
      
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Fleet item added', 
        life: 3000 
      });
    } else {
      // Update existing fleet item
      const updatedFleetData = fleetData.map(item => {
        if (item.id === fleetItem.id) {
          return fleetItem;
        }
        return item;
      });
      
      setFleetData(updatedFleetData);
      
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Fleet item updated', 
        life: 3000 
      });
    }
    
    // Close sidebar only if shouldClose is true
    if (shouldClose) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      
      <FleetList 
        fleetData={fleetData}
        onAddFleet={handleAddFleet}
        onEditFleet={handleEditFleet}
        onViewFleet={handleViewFleet}
        onDeleteFleet={handleDeleteFleet}
        frequentlyEdited={frequentlyEdited}
        refreshTrigger={refreshTrigger}
      />
      
      <FleetSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        fleetItem={selectedFleetItem}
        onSave={handleSaveFleet}
        mode={sidebarMode}
      />
    </div>
  );
};

export default Fleet; 