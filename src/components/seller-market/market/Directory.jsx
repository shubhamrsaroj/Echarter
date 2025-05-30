import React, { useState } from 'react';
import DirectoryMaps from '../market/Directory/DirectoryMaps';
import HaveMaps from '../market/Directory/HaveMaps';

const Directory = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [mapsLoaded, setMapsLoaded] = useState({ directory: false, have: false });

  return (
    <div className="w-full space-y-6">
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 font-medium rounded-md ${activeTab === 'directory' ? 'bg-green-200 text-black' : 'bg-green-300 text-black'}`}
          onClick={() => setActiveTab('directory')}
        >
          Directory
        </button>
        <button
          className={`px-4 py-2 font-medium rounded-md ${activeTab === 'have' ? 'bg-teal-200 text-black' : 'bg-teal-300 text-black'}`}
          onClick={() => setActiveTab('have')}
        >
          Have
        </button>
      </div>

      <div style={{ display: activeTab === 'directory' ? 'block' : 'none' }}>
        <DirectoryMaps 
          onLoad={() => setMapsLoaded(prev => ({ ...prev, directory: true }))}
          isVisible={activeTab === 'directory'} 
        />
      </div>
      
      <div style={{ display: activeTab === 'have' ? 'block' : 'none' }}>
        <HaveMaps 
          onLoad={() => setMapsLoaded(prev => ({ ...prev, have: true }))}
          isVisible={activeTab === 'have'} 
        />
      </div>
    </div>
  );
};

export default Directory; 