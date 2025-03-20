import React from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';

const DateAdjustment = ({ adjustment = {} }) => { // Ensure adjustment is always an object
  const { getCompaniesByDateAdjustment, itineraryData } = useItinerary();

  const handleDateAdjustmentClick = async () => {
    if (itineraryData) {
      await getCompaniesByDateAdjustment(itineraryData);
    }
  };

  // Function to extract details from message safely
  const extractDetailsFromMessage = (message = '') => {
    const hoursMatch = message.match(/up to (\d+) hrs/);
    const hours = hoursMatch ? hoursMatch[1] : 'N/A';
    const description = hoursMatch ? message.split('up to')[0].trim() : message;
    return { description, hours };
  };

  // Extract dynamic content safely
  const { description, hours } = extractDetailsFromMessage(adjustment.message || '');

  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition-transform transform hover:shadow-lg">
      <div className="flex items-center mb-4">
        <img
          src={adjustment.image || 'default-image-url.jpg'} // Provide a fallback image
          alt={adjustment.title || 'Adjustment'}
          className="w-12 h-12 rounded-full mr-4 border border-gray-200"
        />
        <div>
          <h3 className="font-semibold text-lg text-gray-800">{adjustment.title || 'Unknown Adjustment'}</h3>
          <p className="text-sm text-gray-500">{adjustment.message || 'No message available'}</p>
        </div>
      </div>
      <div className="bg-green-100 py-1 px-3 rounded-lg inline-block mb-4">
        <span className="font-medium text-green-800 text-sm">
          {adjustment.count ? `${adjustment.count} Nearby` : 'No Nearby Adjustments'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {description} {hours !== 'N/A' ? `up to ${hours} hrs` : ''}
      </p>
      <div className="flex justify-end">
        <button
          onClick={handleDateAdjustmentClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
        >
          {adjustment.button || 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default DateAdjustment;
