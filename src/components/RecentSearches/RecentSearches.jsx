import React, { useState, useEffect } from 'react';
import { useRecentItinerary } from '../../context/RecentItineraryContext/RecentItineraryContext';
import { useSearch } from '../../context/CharterSearch/SearchContext';
import { Search, X, Pencil, Mic } from 'lucide-react';
import SpeechInput from '../seller/Review/SpeechInput';

const RecentSearches = ({ onSelectItinerary, onClose }) => {
  const { recentItineraries, updateItineraryText, fetchRecentItineraries, loading, updating } = useRecentItinerary();
  const { setSelectedBaseOption } = useSearch();
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [needsStatus, setNeedsStatus] = useState({});

  useEffect(() => {
    // Initialize needs status for each itinerary
    const initialNeeds = {};
    recentItineraries.forEach(itinerary => {
      initialNeeds[itinerary.itineraryID] = itinerary.needs || false;
    });
    setNeedsStatus(initialNeeds);
  }, [recentItineraries]);

  const handleSelectItinerary = (itinerary) => {
    if (selectedId === itinerary.itineraryID) {
      return;
    }
    
    setSelectedId(itinerary.itineraryID);
    setSelectedBaseOption(null);
    if (onSelectItinerary) {
      onSelectItinerary(itinerary.itineraryID);
    }
  };

  const handleEdit = (itinerary) => {
    setEditingId(itinerary.itineraryID);
    setEditText(itinerary.itineraryText);
    
    // Ensure we have the correct needs status when entering edit mode
    setNeedsStatus(prev => ({
      ...prev,
      [itinerary.itineraryID]: itinerary.needs || false
    }));
  };

  const handleSaveEdit = async (itineraryId) => {
    if (!editText.trim()) return;
    
    try {
      // Update to also pass the needs status
      const success = await updateItineraryText(itineraryId, editText, needsStatus[itineraryId]);
      if (success) {
        await fetchRecentItineraries();
        setEditingId(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Failed to update itinerary:', error);
    }
  };

  const handleNeedsToggle = async (itineraryId, isEditing = false) => {
    // Update local state first for immediate UI feedback
    const newNeedsValue = !needsStatus[itineraryId];
    setNeedsStatus(prev => ({
      ...prev,
      [itineraryId]: newNeedsValue
    }));
    
    // If not in edit mode, update directly on the server
    if (!isEditing) {
      try {
        // Get the current text for this itinerary
        const itinerary = recentItineraries.find(item => item.itineraryID === itineraryId);
        if (itinerary) {
          const success = await updateItineraryText(itineraryId, itinerary.itineraryText, newNeedsValue);
          if (success) {
            await fetchRecentItineraries();
          }
        }
      } catch (error) {
        console.error('Failed to update needs status:', error);
        // Revert the local state if the update failed
        setNeedsStatus(prev => ({
          ...prev,
          [itineraryId]: !newNeedsValue
        }));
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-black w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-2xl ">Recent Search</h1>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 text-black hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl px-4 py-5 border border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="w-[40px] h-[40px] bg-gray-300 rounded"></div>
                    <div className="w-[40px] h-[40px] bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !recentItineraries.length ? (
        <div className="text-center py-8 text-gray-500">No recent searches found</div>
      ) : (
        <div className="space-y-3 max-h-[calc(80vh-100px)] overflow-y-auto ">
          {recentItineraries.map((itinerary) => (
            <div
              key={itinerary.itineraryID}
              className="rounded-xl px-4 py-5 border border-black"
            >
              {editingId === itinerary.itineraryID ? (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-bold text-black">Edit Itinerary</span>
                    <div className="flex items-center">
                      <span className="text-sm mr-4">Needs</span>
                      <button 
                        onClick={() => handleNeedsToggle(itinerary.itineraryID, true)}
                        className={`w-12 h-6 rounded-full relative flex items-center transition-colors duration-200 ${
                          needsStatus[itinerary.itineraryID] ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          needsStatus[itinerary.itineraryID] ? 'right-1' : 'left-1'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative mb-4">
                    <SpeechInput
                      value={editText}
                      onChange={setEditText}
                      disabled={updating}
                      placeholder="Enter itinerary details"
                      className="w-full px-4 py-3 border border-black rounded-lg text-black min-h-[100px] resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(itinerary.itineraryID)}
                      disabled={updating}
                      className="flex-1 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center justify-center"
                    >
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-black flex-1 mr-4">{itinerary.itineraryText}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(itinerary)}
                        className="flex items-center text-black hover:text-gray-600"
                      >
                        <Pencil size={18} />
                        <span className="text-xs ml-1">Edit</span>
                      </button>
                      <button
                        onClick={() => handleSelectItinerary(itinerary)}
                        disabled={selectedId === itinerary.itineraryID}
                        className={`flex items-center text-black ${
                          selectedId === itinerary.itineraryID ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'
                        }`}
                      >
                        <Search size={18} />
                        <span className="text-xs ml-1">More Options</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSearches;