
import React from 'react';
import { Plane, Users, Clock } from 'lucide-react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';

const BaseCard = ({ itineraryData }) => {
  const { getCompaniesByCategory } = useItinerary();
  
  const formatPrice = (price) => {
    return price.toLocaleString('en-IN');
  };

  const formatFlightTime = (time) => {
    if (typeof time === 'string' && time.includes(':')) {
      const [hours, minutes] = time.split(':').map(Number);
      return `${hours} hrs ${minutes} min`;
    }
    return time;
  };
  
  const handleCardButtonClick = (baseOption) => {
    if (itineraryData.flights && itineraryData.flights.length > 0) {
      const firstFlight = itineraryData.flights[0];
      getCompaniesByCategory(baseOption, firstFlight);
    }
  };

  return (
    <div className="space-y-6">
      {itineraryData.base.map((option, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 transition-transform transform hover:scale-105 w-full"
        >
          <div className="flex items-center mb-4">
            {option.image ? (
              <img src={option.image} alt={option.category} className="w-14 h-14 mr-4" />
            ) : (
              <div className="w-14 h-14 mr-4 flex items-center justify-center bg-gray-100 rounded-full">
                <Plane size={24} color="black" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-xl text-gray-900">{option.category}</h3>
              <p className="text-sm text-gray-500">{option.message}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <Users size={16} className="mr-2 text-gray-500" />
              <div>
                <span className="text-xs text-gray-500">Max Passengers</span>
                <p className="font-medium text-gray-800 text-lg">{option.maxPax}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-gray-500" />
              <div>
                <span className="text-xs text-gray-500">Flight Duration</span>
                <p className="font-medium text-gray-800 text-lg">{formatFlightTime(option.totalFlightTime)}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center text-xl font-bold text-gray-900">
              {option.currencySymbol} {formatPrice(option.price)}
            </span>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
              onClick={() => handleCardButtonClick(option)}
            >
              {option.buttonName}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BaseCard;