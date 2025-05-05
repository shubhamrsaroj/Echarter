import React, { useState } from 'react';
import { useRecentItinerary } from '../../context/RecentItineraryContext/RecentItineraryContext';
import { useSearch } from '../../context/CharterSearch/SearchContext';
import { Search, X, Pencil } from 'lucide-react';

const RecentSearches = ({ onSelectItinerary, onClose }) => {
  const { recentItineraries, updateItineraryText, fetchRecentItineraries, loading, updating } = useRecentItinerary();
  const { setSelectedBaseOption } = useSearch();
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

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
  };

  const handleSaveEdit = async (itineraryId) => {
    if (!editText.trim()) return;
    
    try {
      const success = await updateItineraryText(itineraryId, editText);
      if (success) {
        await fetchRecentItineraries();
        setEditingId(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Failed to update itinerary:', error);
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
              className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-5 hover:bg-gray-200 border border-black"
            >
              {editingId === itinerary.itineraryID ? (
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSaveEdit(itinerary.itineraryID)}
                      disabled={updating}
                      className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center justify-center w-[80px]"
                    >
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-[80px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-black">{itinerary.itineraryText}</div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(itinerary)}
                  className="flex flex-col items-center justify-center text-black hover:text-gray-600"
                  disabled={editingId === itinerary.itineraryID}
                >
                  <Pencil size={18} />
                  <span className="text-xs mt-1">Edit</span>
                </button>
                <button
                  onClick={() => handleSelectItinerary(itinerary)}
                  disabled={selectedId === itinerary.itineraryID}
                  className={`flex flex-col items-center justify-center text-black ${
                    selectedId === itinerary.itineraryID ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'
                  }`}
                >
                  <Search size={18} />
                  <span className="text-xs mt-1">More Options</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSearches;