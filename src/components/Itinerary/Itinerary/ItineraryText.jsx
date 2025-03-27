import React from "react";
import { PlaneTakeoff, PlaneLanding, ArrowRight } from "lucide-react";

const ItineraryText = ({ itinerary }) => {
  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-b-3 p-6 relative">
      <h2 className="text-2xl font-bold mb-4 text-black text-center">
        Itinerary
      </h2>

      {itinerary.map((leg, index) => (
        <div
          key={index}
          className="mb-4 p-4 border rounded-lg shadow-sm flex flex-col items-center"
        >
          {/* Date Positioned at the Center Top */}
          <div className="text-center text-black font-medium mb-2">
            {formatDate(leg.date)}
          </div>

          <div className="flex items-center justify-between w-full">
            {/* Departure Section */}
            <div className="flex flex-col items-center">
              <PlaneTakeoff className="text-gray-600 w-6 h-6" />
              <span className="font-bold text-black mt-1">{leg.dep_place}</span>
            </div>

            {/* Arrow Section */}
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full justify-center">
                <div className="border-t-2 border-gray-600 flex-1"></div>
                <ArrowRight className="text-gray-600 w-8 h-8 mx-2" />
                <div className="border-t-2 border-gray-600 flex-1"></div>
              </div>

              {/* Category and Passenger Below the Arrow */}
              <div className="text-sm text-gray-600 mt-1 text-center">
                {leg.flight_cat.charAt(0) +
                  leg.flight_cat.slice(1).toLowerCase()}
                , Passenger: {leg.pax}
              </div>
            </div>

            {/* Arrival Section */}
            <div className="flex flex-col items-center">
              <PlaneLanding className="text-gray-600 w-6 h-6" />
              <span className="font-bold text-black mt-1">{leg.arrv_place}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItineraryText;
