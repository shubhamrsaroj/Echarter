import React from 'react';

import Sidebar from '../components/sidebar/Sidebar';


const ItineraryLayout = ({ children }) => {
  
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
   
  );
};

export default ItineraryLayout;