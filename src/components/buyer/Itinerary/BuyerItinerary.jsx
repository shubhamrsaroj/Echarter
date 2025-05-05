import React, { useState, useEffect } from "react";
import { PlaneTakeoff, PlaneLanding, ArrowRight, X, Pencil, Mic } from "lucide-react";
import { useBuyerContext } from "../../../context/buyer/BuyerContext";

const BuyerItinerary = ({ itinerary, loading, error, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [itineraryText, setItineraryText] = useState("");
  const [needsStatus, setNeedsStatus] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateItineraryNeeds, fetchItinerary } = useBuyerContext();
  
  useEffect(() => {
    if (itinerary) {
      setNeedsStatus(itinerary.needs );
      setItineraryText(itinerary.itineraryText || "");
    }
  }, [itinerary]);



  console.log("itinerary data:", itinerary);
  
  // Handle edit mode toggle
  const handleEditClick = () => {
    if (itinerary && itinerary.itineraryText) {
      setItineraryText(itinerary.itineraryText);
    }
    setIsEditing(true);
  };
  
  // Handle needs toggle
  const handleNeedsToggle = async () => {
    if (!itinerary?.itineraryId) return;
    
    const newNeedsStatus = !needsStatus;
    setNeedsStatus(newNeedsStatus);
    
    // Only make API call if not in edit mode
    if (!isEditing) {
      // When not in edit mode, only send needs status without text
      await updateItineraryNeeds(itinerary.itineraryId, newNeedsStatus);
    }
  };
  
  // Handle update submission
  const handleUpdate = async () => {
    if (!itinerary?.itineraryId || !itineraryText.trim()) return;
    
    setIsUpdating(true);
    const success = await updateItineraryNeeds(itinerary.itineraryId, needsStatus, itineraryText.trim());
    if (success) {
      await fetchItinerary(itinerary.itineraryId);
      setIsEditing(false);
    }
    setIsUpdating(false);
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-black p-6 relative">
        <div className="relative mb-8 pt-4">
          <div className="absolute top-4 right-3 w-10 h-10 flex items-center justify-center bg-transparent rounded-full border border-gray-300">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          </div>
          <div className="h-8 w-32 bg-gray-300 rounded mx-auto mb-4"></div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
            <div className="flex items-center">
              <div className="h-6 w-16 bg-gray-300 rounded mr-4"></div>
              <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="h-6 w-48 bg-gray-300 rounded"></div>
            <div className="h-5 w-5 bg-gray-300 rounded-full ml-1"></div>
          </div>
        </div>
        
        <div className="p-4 border border-gray-300 rounded-lg">
          <div className="h-6 w-32 bg-gray-300 rounded mx-auto mb-4"></div>
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-center w-1/4">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div className="h-5 w-20 bg-gray-300 rounded mt-2"></div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full justify-center">
                <div className="border-t-2 border-gray-300 flex-1"></div>
                <div className="w-6 h-6 bg-gray-300 rounded-full mx-2"></div>
                <div className="border-t-2 border-gray-300 flex-1"></div>
              </div>
              <div className="h-5 w-24 bg-gray-300 rounded mt-2"></div>
            </div>
            <div className="flex flex-col items-center w-1/4">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div className="h-5 w-20 bg-gray-300 rounded mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f6f6f6] rounded-xl border border-black p-6 relative">
        <button
          className="absolute top-4 right-3 w-10 h-10 flex items-center justify-center bg-transparent rounded-full hover:bg-gray-200 border border-black"
          onClick={onClose}
        >
          <X className="w-6 h-6 cursor-pointer text-black" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-black text-center">Itinerary</h2>
        <div className="text-center text-black">Error: {error}</div>
      </div>
    );
  }

  if (!itinerary || !itinerary.itinerary || !Array.isArray(itinerary.itinerary) || itinerary.itinerary.length === 0) {
    return (
      <div className="bg-[#f6f6f6] rounded-xl border border-black p-6 relative">
        <button
          className="absolute top-4 right-3 w-10 h-10 flex items-center justify-center bg-transparent rounded-full hover:bg-gray-200 border border-black"
          onClick={onClose}
        >
          <X className="w-6 h-6 cursor-pointer text-black" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-black text-center">Itinerary</h2>
        <div className="text-center text-black">No itinerary data available</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[#f6f6f6] h-full p-4">
      <div className="relative mb-6">
        <button
          className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center bg-transparent rounded-full hover:bg-gray-200 border border-black"
          onClick={onClose}
        >
          <X className="w-6 h-6 cursor-pointer text-black" />
        </button>
        <h2 className="text-2xl font-bold text-black text-center">Itinerary</h2>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-base font-bold text-black">{itinerary.tripCategory}</span>
          <div className="flex items-center">
            <span className="text-sm mr-4">Needs</span>
            <button 
              onClick={handleNeedsToggle}
              className={`w-12 h-6 rounded-full relative flex items-center transition-colors duration-200 ${
                needsStatus ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                needsStatus ? 'right-1' : 'left-1'
              }`}></div>
            </button>
          </div>
        </div>

        {isEditing ? (
          <div>
            <div className="relative mb-4">
              <textarea
                value={itineraryText}
                onChange={(e) => setItineraryText(e.target.value)}
                className="w-full px-4 py-3 border border-black rounded-lg text-black min-h-[120px] resize-none"
                placeholder="Enter itinerary details"
              />
              <Mic className="absolute right-3 bottom-3 text-black w-5 h-5" />
            </div>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full bg-black text-white py-3 rounded-lg font-medium mb-3"
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <p className="text-base text-black">
              {itineraryText || "No itinerary text"}
            </p>
            <button 
              onClick={handleEditClick}
              className="text-black ml-1"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      {!isEditing && (
        <div className="space-y-4 overflow-y-auto">
          {itinerary.itinerary.map((leg, index) => (
            <div key={index} className="p-4 bg-white border-2 border-black rounded-lg shadow-sm">
              <div className="text-center text-black font-medium mb-2 text-lg">
                {leg.date ? formatDate(leg.date) : 'Date not specified'}
              </div>
              
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-center w-1/4">
                  <PlaneTakeoff className="text-black w-6 h-6" />
                  <span className="font-bold text-black mt-1 text-base text-center">
                    {leg.departurePlace || 'N/A'}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col items-center px-1 w-2/4">
                  <div className="flex items-center w-full justify-center">
                    <div className="border-t-2 border-black flex-1"></div>
                    <ArrowRight className="text-black w-6 h-6 mx-2 flex-shrink-0" />
                    <div className="border-t-2 border-black flex-1"></div>
                  </div>
                  <div className="text-sm text-black mt-1 text-center">
                    {`${leg.flightCategory || 'N/A'} ${leg.pax || 'N/A'}`}
                  </div>
                </div>
                
                <div className="flex flex-col items-center w-1/4">
                  <PlaneLanding className="text-black w-6 h-6" />
                  <span className="font-bold text-black mt-1 text-base text-center">
                    {leg.arrivalPlace || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerItinerary;
