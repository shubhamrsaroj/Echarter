import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { updateConversationEquipment, getTailDetailsById } from '../../api/ConversationActivity/GetTailDetailsService';
import { toast } from 'react-toastify';

const AircraftSelector = ({ onSelect, conversationId, aircraftList = [], loading = false, error = null, onUpdateSuccess }) => {
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSelect = (aircraft) => {
    setSelectedAircraft(aircraft);
    setIsOpen(false);
    if (onSelect) {
      onSelect(aircraft);
    }
  };

  const handleShare = async () => {
    if (!selectedAircraft) return;
    
    if (!conversationId) {
      toast.error('Conversation ID is required to share aircraft details');
      return;
    }

    try {
      setUpdating(true);
      const response = await updateConversationEquipment(conversationId, selectedAircraft.id);
      const updatedDetails = await getTailDetailsById(conversationId);
      toast.success(response.message || 'Aircraft details updated successfully');
      if (onSelect) {
        onSelect(updatedDetails.data);
      }
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedDetails.data);
      }
    } catch (error) {
      console.error('Error in sharing aircraft details:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-black rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-3 border border-gray-300 rounded-md flex justify-between items-center bg-white hover:bg-gray-50"
          >
            <span className="text-black">
              {selectedAircraft 
                ? selectedAircraft.label 
                : loading 
                  ? 'Loading aircraft...' 
                  : 'Select an aircraft'}
            </span>
            <ChevronDown className="h-5 w-5 text-black" />
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {aircraftList.length > 0 ? (
                aircraftList.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 text-black"
                    onClick={() => handleSelect(item)}
                  >
                    {item.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-black">
                  {loading ? 'Loading...' : 'No aircraft available'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleShare}
          disabled={!selectedAircraft || updating}
          className={`px-4 py-2 rounded-md ${
            selectedAircraft && !updating
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-black cursor-not-allowed'
          }`}
        >
          {updating ? 'Sharing...' : 'Share Details'}
        </button>
      </div>
    </div>
  );
};

export default AircraftSelector; 