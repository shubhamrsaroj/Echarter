

import React from 'react';
import { Plane, Info } from 'lucide-react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';

const BaseCard = ({ itineraryData = {} }) => {
  const { getCompaniesByCategory, setSelectedBaseOption } = useItinerary();
  
  const formatPrice = (price) => {
    return price?.toLocaleString('en-IN') || 'N/A';
  };
  
  const handleCardButtonClick = (baseOption) => {
    // Save the selected base option in context
    setSelectedBaseOption(baseOption);
    
    if (itineraryData?.flights?.length > 0) {
      const firstFlight = itineraryData.flights[0];
      getCompaniesByCategory(baseOption, firstFlight);
    }
  };
  
  return (
    <div className="space-y-6">
      {Array.isArray(itineraryData.base) && itineraryData.base.length > 0 && (
        itineraryData.base.map((option, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-b-3 p-6 relative"
          >
            <div className="absolute top-4 right-4 text-right">
              <h3 className="font-semibold text-lg text-gray-800">{option.category}</h3>
              <p className="text-sm text-gray-500 mr-6">{option.message}</p>
              <div className="flex items-center justify-end mt-2">
                <Info className="text-gray-700 ml-1" size={20} />
              </div>
            </div>
            
            <div className="flex items-center mb-2">
              {option.image ? (
                <img
                  src={option.image}
                  alt={option.category}
                  className="w-24 h-24 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100">
                  <Plane size={32} color="black" />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-800">Price From</h4>
                <span className="font-medium text-black text-md">
                  {`${option.currencySymbol || '₹'} ${formatPrice(option.price)}`}
                </span>
              </div>
              <button
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
                onClick={() => handleCardButtonClick(option)}
              >
                {option.buttonName}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BaseCard;