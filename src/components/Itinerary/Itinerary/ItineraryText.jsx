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
    <div className="bg-white rounded-xl border border-black p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-black text-center">
        Itinerary
      </h2>

      {itinerary.map((leg, index) => (
        <div
          key={index}
          className="mb-3 md:mb-4 p-2 sm:p-3 md:p-4 border border-black rounded-lg shadow-sm flex flex-col items-center"
        >
          {/* Date Positioned at the Center Top */}
          <div className="text-center text-black font-medium mb-1 md:mb-2 text-sm sm:text-base md:text-lg">
            {formatDate(leg.date)}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2 sm:gap-0">
            {/* Departure Section */}
            <div className="flex flex-col items-center">
              <PlaneTakeoff className="text-black w-5 h-5 md:w-6 md:h-6" />
              <span className="font-bold text-black mt-1 text-sm sm:text-base md:text-lg text-center">
                {leg.dep_place}
              </span>
            </div>

            {/* Arrow Section */}
            <div className="flex-1 flex flex-col items-center min-w-0 mx-1 sm:mx-2">
              <div className="flex items-center w-full justify-center">
                <div className="border-t-2 border-black flex-1 hidden sm:block"></div>
                <ArrowRight className="text-black w-6 h-6 md:w-8 md:h-8 mx-1 md:mx-2" />
                <div className="border-t-2 border-black flex-1 hidden sm:block"></div>
              </div>

              {/* Category and Passenger Below the Arrow */}
              <div className="text-sm sm:text-base md:text-lg text-black mt-1 text-center font-medium px-1 truncate w-full">
                <span className="whitespace-nowrap">
                  {leg.flight_cat.charAt(0).toUpperCase() +
                    leg.flight_cat.slice(1).toLowerCase()}
                </span>
                <span className="whitespace-nowrap">, Passenger: {leg.pax}</span>
              </div>
            </div>

            {/* Arrival Section */}
            <div className="flex flex-col items-center">
              <PlaneLanding className="text-black w-5 h-5 md:w-6 md:h-6" />
              <span className="font-bold text-black mt-1 text-sm sm:text-base md:text-lg text-center">
                {leg.arrv_place}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItineraryText;
