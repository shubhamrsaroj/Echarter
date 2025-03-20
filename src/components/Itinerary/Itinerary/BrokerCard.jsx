import React from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';

const BrokerCard = ({ broker = {} }) => { // Ensure broker is an empty object if undefined
  const { getCompaniesByBroker, itineraryData } = useItinerary();

  const handleBrokerClick = async () => {
    if (itineraryData) {
      await getCompaniesByBroker(itineraryData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition-transform transform hover:shadow-lg">
      <div className="flex items-center mb-4">
        <img
          src={broker.image || ''} // Provide a fallback image
          alt="Broker"
          className="w-12 h-12 rounded-full mr-4 border border-gray-200"
        />
        <div>
          <h3 className="font-semibold text-lg text-gray-800">{broker.title || 'Unknown Broker'}</h3>
          <p className="text-sm text-gray-500">{broker.message || 'No message available'}</p>
        </div>
      </div>
      <div className="bg-green-100 py-1 px-3 rounded-lg inline-block mb-4">
        <span className="font-medium text-green-800 text-sm">{broker.count ? `${broker.count} Nearby` : 'No Nearby Brokers'}</span>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleBrokerClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
        >
          {broker.button || 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default BrokerCard;
