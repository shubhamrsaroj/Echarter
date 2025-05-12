import React from "react";
import { PlaneTakeoff, PlaneLanding, ArrowRight } from "lucide-react";

const ItinerarySearchCard = ({ itinerary }) => {
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

  // For debugging - log itinerary
  console.log("Itinerary data:", itinerary);

  return (
    <div className="bg-white rounded-xl border border-black p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-black text-center">
        Itinerary
      </h2>

      {itinerary.map((leg, index) => {
        // Debug each leg
        console.log(`Leg ${index}:`, leg);
        console.log(`Leg ${index} flight_cat:`, leg.flight_cat);
        console.log(`Leg ${index} pax:`, leg.pax);
        
        return (
          <div
            key={index}
            className="mb-3 md:mb-4 p-2 sm:p-3 md:p-4 border border-black rounded-lg shadow-sm flex flex-col items-center"
          >
            {/* Date Positioned at the Center Top */}
            <div className="text-center text-black font-medium mb-1 md:mb-2 text-sm sm:text-base md:text-lg">
              {formatDate(leg.date)}
            </div>

            <div className="flex flex-row items-center justify-between w-full gap-2">
              {/* Departure Section */}
              <div className="flex flex-col items-center">
                <PlaneTakeoff className="text-black w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-black mt-1 text-sm sm:text-base md:text-lg text-center">
                  {leg.dep_place}
                </span>
              </div>

              {/* Middle section with arrow and details */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Flight Category Positioned Above Arrow */}
                {leg.flight_cat && (
                  <div className="text-black text-xs sm:text-sm font-medium mb-1">
                    {typeof leg.flight_cat === 'string'
                      ? leg.flight_cat.charAt(0).toUpperCase() + leg.flight_cat.slice(1).toLowerCase()
                      : leg.flight_cat}
                  </div>
                )}

                {/* Arrow Section */}
                <div className="flex items-center w-full justify-center my-1">
                  <div className="border-t-2 border-black flex-1"></div>
                  <ArrowRight className="text-black w-6 h-6 mx-1" />
                  <div className="border-t-2 border-black flex-1"></div>
                </div>

                {/* Passenger Count Below Arrow */}
                {leg.pax && (
                  <div className="text-black text-xs sm:text-sm font-medium mt-1">
                    Passenger: {leg.pax}
                  </div>
                )}
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
        );
      })}
    </div>
  );
};

export default ItinerarySearchCard;
