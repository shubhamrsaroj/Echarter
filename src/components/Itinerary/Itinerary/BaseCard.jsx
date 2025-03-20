import React from 'react';
import { Plane, Users, Clock } from 'lucide-react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';

const BaseCard = ({ itineraryData = {} }) => {  // Ensure itineraryData is never undefined
  const { getCompaniesByCategory } = useItinerary();
  
  const formatPrice = (price) => {
    return price?.toLocaleString('en-IN') || 'N/A';
  };

  const formatFlightTime = (time) => {
    if (typeof time === 'string' && time.includes(':')) {
      const [hours, minutes] = time.split(':').map(Number);
      return `${hours} hrs ${minutes} min`;
    }
    return time || 'N/A';
  };
  
  const handleCardButtonClick = (baseOption) => {
    if (itineraryData?.flights?.length > 0) {
      const firstFlight = itineraryData.flights[0];
      getCompaniesByCategory(baseOption, firstFlight);
    }
  };

  return (
    <div className="space-y-6">
      {Array.isArray(itineraryData.base) && itineraryData.base.length > 0 ? (
        itineraryData.base.map((option, index) => (
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
                <h3 className="font-semibold text-xl text-gray-900">{option.category || 'Unknown Category'}</h3>
                <p className="text-sm text-gray-500">{option.message || 'No description available'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <Users size={16} className="mr-2 text-gray-500" />
                <div>
                  <span className="text-xs text-gray-500">Max Passengers</span>
                  <p className="font-medium text-gray-800 text-lg">{option.maxPax || 'N/A'}</p>
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
                {option.currencySymbol || '₹'} {formatPrice(option.price)}
              </span>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
                onClick={() => handleCardButtonClick(option)}
              >
                {option.buttonName || 'View Details'}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No base options available.</p>
      )}
    </div>
  );
};

export default BaseCard;
