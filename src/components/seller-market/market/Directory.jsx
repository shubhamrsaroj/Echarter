import React, { useState } from 'react';
import HaveMaps from '../market/Directory/HaveMaps';

const Directory = () => {
  const [mapsLoaded, setMapsLoaded] = useState({ have: false });

  return (
    <div className="w-full space-y-6">
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 font-medium rounded-md bg-teal-200 text-black"
        >
          Haves
        </button>
      </div>

      <div>
        <HaveMaps 
          onLoad={() => setMapsLoaded(prev => ({ ...prev, have: true }))}
          isVisible={true}
        />
      </div>
    </div>
  );
};

export default Directory;