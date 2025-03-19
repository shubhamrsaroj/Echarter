import React from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaPlane, FaRuler } from "react-icons/fa";

const ItineraryText = ({ itinerary }) => {
  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-black">
        Itinerary Details
      </h2>

      {itinerary.map((leg, index) => (
        <div key={index} className="mb-6 p-4 border rounded-lg shadow-sm">
          <div className="flex items-center text-lg font-semibold text-black mb-3">
            <FaMapMarkerAlt className="mr-2" />
            Leg {leg.leg_number}: {leg.dep_place} → {leg.arrv_place}
          </div>

          <div className="grid grid-cols-2 gap-4 text-black">
            <div className="flex items-center gap-2">
              <FaCalendarAlt />
              <div>
                <p className="text-sm text-gray-700">Date</p>
                <p className="font-medium">{formatDate(leg.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FaUserFriends />
              <div>
                <p className="text-sm text-gray-700">Passengers</p>
                <p className="font-medium">{leg.pax}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FaPlane />
              <div>
                <p className="text-sm text-gray-700">Category</p>
                <p className="font-medium">{leg.flight_cat}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FaRuler />
              <div>
                <p className="text-sm text-gray-700">Distance</p>
                <p className="font-medium">{leg.distance.toFixed(2)} km</p>
              </div>
            </div>
          </div>

          {index < itinerary.length - 1}
        </div>
      ))}
    </div>
  );
};

export default ItineraryText;