import React, { useState } from "react";
import { PlaneTakeoff, PlaneLanding, ArrowRight, X, Pencil, Mic } from "lucide-react";

const BuyerItinerary = ({ itinerary, loading, error, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [itineraryText, setItineraryText] = useState("");
  
  // Handle edit mode toggle
  const handleEditClick = () => {
    if (itinerary && itinerary.itineraryText) {
      setItineraryText(itinerary.itineraryText);
    }
    setIsEditing(true);
  };
  
  // Handle update submission
  const handleUpdate = () => {
    if (onUpdate && itineraryText.trim()) {
      onUpdate(itineraryText);
    }
    setIsEditing(false);
  };
  
  if (loading) {
    return (
      <div className="bg-[#f6f6f6] rounded-xl border border-black p-6 relative animate-pulse">
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

  if (!itinerary || !itinerary.itinerary) {
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

  // Get the first leg of the itinerary or use default values
  const firstLeg = Array.isArray(itinerary.itinerary) && itinerary.itinerary.length > 0 
    ? itinerary.itinerary[0] 
    : { date: new Date(), departurePlace: "Teterboro", arrivalPlace: "Miami", flightCategory: "Domestic", pax: "4" };

  return (
    <div className="bg-[#f6f6f6] rounded-xl border border-black p-4 md:p-6 w-full sticky top-4">
      <div className="relative mb-8 pt-4">
        <button
          className="absolute top-4 right-3 w-10 h-10 flex items-center justify-center bg-transparent rounded-full hover:bg-gray-200 border border-black"
          onClick={onClose}
        >
          <X className="w-6 h-6 cursor-pointer text-black" />
        </button>
        <h2 className="text-2xl font-bold text-black text-center">Itinerary</h2>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-base font-bold text-black">Passenger</span>
          <div className="flex items-center">
            <span className="text-sm mr-4">Needs</span>
            <div className="w-12 h-6 bg-green-500 rounded-full relative flex items-center">
              <div className="absolute right-1 w-5 h-5 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {isEditing ? (
          // Edit mode UI
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
              className="w-full bg-black text-white py-3 rounded-lg font-medium mb-3"
            >
              Update
            </button>
          </div>
        ) : (
          // View mode UI - Position pencil icon directly adjacent to the text
          <div className="flex items-center">
            <p className="text-base text-black">
              {itinerary.itineraryText || "No itinerary text"}
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
        <div className="p-4 bg-white border border-black rounded-lg shadow-sm">
          <div className="text-center text-black font-medium mb-2 text-lg">
            {firstLeg.date ? formatDate(firstLeg.date) : "March 21, 2025"}
          </div>
          
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-center w-1/4">
              <PlaneTakeoff className="text-black w-6 h-6" />
              <span className="font-bold text-black mt-1 text-base text-center">
                {firstLeg.departurePlace || "Teterboro"}
              </span>
            </div>
            
            <div className="flex-1 flex flex-col items-center px-1 w-2/4">
              <div className="flex items-center w-full justify-center">
                <div className="border-t-2 border-black flex-1"></div>
                <ArrowRight className="text-black w-6 h-6 mx-2 flex-shrink-0" />
                <div className="border-t-2 border-black flex-1"></div>
              </div>
              <div className="text-sm text-black mt-1 text-center">
                {`${firstLeg.flightCategory || "Domestic"} ${firstLeg.pax || "4"}`}
              </div>
            </div>
            
            <div className="flex flex-col items-center w-1/4">
              <PlaneLanding className="text-black w-6 h-6" />
              <span className="font-bold text-black mt-1 text-base text-center">
                {firstLeg.arrivalPlace || "Miami"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BuyerItinerary;
