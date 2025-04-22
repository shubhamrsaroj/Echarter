import React from "react";
import { PlaneTakeoff, PlaneLanding, ArrowRight, X } from "lucide-react";

const DealItinerary = ({ itinerary, loading, error, onClose }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-black p-6 relative animate-pulse">
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 border border-black"
          onClick={onClose}
        >
          <X className="w-6 h-6 cursor-pointer text-black" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-black text-center">Itinerary</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="mb-4 p-4 border border-black rounded-lg shadow-sm flex flex-col items-center">
              <div className="h-4 w-32 bg-black rounded mb-2"></div>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-black rounded-full"></div>
                  <div className="h-4 w-20 bg-black rounded mt-1"></div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full justify-center">
                    <div className="border-t-2 border-black flex-1"></div>
                    <div className="w-8 h-8 bg-black rounded-full mx-2"></div>
                    <div className="border-t-2 border-black flex-1"></div>
                  </div>
                  <div className="h-4 w-24 bg-black rounded mt-1"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-black rounded-full"></div>
                  <div className="h-4 w-20 bg-black rounded mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-black p-6 relative">
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 border border-black"
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
      <div className="bg-white rounded-xl border-2 border-black p-6 relative">
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 border border-black"
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
    <div className="bg-[#f6f6f6] rounded-xl  border border-black p-4 md:p-6 w-full">
      <div className="relative">
        <button
          className="absolute top-0 right-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#f6f6f6] rounded-full hover:bg-gray-300 border border-black"
          onClick={onClose}
        >
          <X className="w-5 h-5 md:w-6 md:h-6 cursor-pointer text-black" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-black text-center pr-10">Itinerary</h2>
      </div>

      <div className="mb-4 space-y-2">
        <div>
          <p className="text-sm font-bold text-black">{itinerary.tripCategory}</p>
        </div>
        <p className="text-sm text-black">{itinerary.itineraryText}</p>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {Array.isArray(itinerary.itinerary) && itinerary.itinerary.map((leg, index) => (
          <div key={index} className="mb-3 md:mb-4 p-3 md:p-4 border border-black rounded-lg shadow-sm">
            <div className="text-center text-black font-medium mb-2 text-base md:text-lg truncate">
              {formatDate(leg.date)}
            </div>
            
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-center w-1/4">
                <PlaneTakeoff className="text-black w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-black mt-1 text-sm md:text-base text-center truncate">
                  {leg.departurePlace || "N/A"}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col items-center px-1 w-2/4">
                <div className="flex items-center w-full justify-center">
                  <div className="border-t-2 border-black flex-1"></div>
                  <ArrowRight className="text-black w-6 h-6 mx-1 md:w-8 md:h-8 md:mx-2 flex-shrink-0" />
                  <div className="border-t-2 border-black flex-1"></div>
                </div>
                <div className="text-xs md:text-sm text-black mt-1 text-center">
                  {`${leg.flightCategory ? leg.flightCategory.charAt(0).toUpperCase() + leg.flightCategory.slice(1).toLowerCase() : "N/A"} ${leg.pax || "0"}`}
                </div>
              </div>
              
              <div className="flex flex-col items-center w-1/4">
                <PlaneLanding className="text-black w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-black mt-1 text-sm md:text-base text-center truncate">
                  {leg.arrivalPlace || "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealItinerary;
