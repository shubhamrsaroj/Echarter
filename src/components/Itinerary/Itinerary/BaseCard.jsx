import React from 'react';
import { Plane, Info } from 'lucide-react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';

const BaseCard = ({ itineraryData = {} }) => {
  const { getCompaniesByCategory } = useItinerary();

  const formatPrice = (price) => {
    return price?.toLocaleString('en-IN') || 'N/A';
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
            className="bg-white rounded-xl shadow-md p-6 transition-transform transform hover:shadow-lg relative"
          >
            <div className="absolute top-4 right-4 text-right">
              <h3 className="font-semibold text-lg text-gray-800">{option.category || 'Unknown Category'}</h3>
              <p className="text-sm text-gray-500 mr-6">{option.message || 'No description available'}</p>
              <div className="flex items-center justify-end mt-2">
                <Info className="text-blue-500 ml-1" size={16} />
              </div>
            </div>

            <div className="flex items-center mb-4">
              {option.image ? (
                <img
                  src={option.image}
                  alt={option.category}
                  className="w-16 h-16 rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100">
                  <Plane size={24} color="black" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-10">
  <div>
    <h4 className="font-semibold text-sm text-gray-800">Price From</h4>
    <span className="font-medium text-black text-md">
      {`${option.currencySymbol || '₹'} ${formatPrice(option.price)}`}
    </span>
  </div>
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