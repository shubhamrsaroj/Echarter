import React from 'react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';

const MatchCard = ({ match }) => {
  const { getCompaniesByMatch, itineraryData } = useItinerary();

  const handleMatchClick = async () => {
    if (itineraryData) {
      await getCompaniesByMatch(itineraryData);
    }
  };

  // Function to dynamically extract hours or other details from the message
  const extractDetailsFromMessage = (message) => {
    // Example: If message contains "up to 130 hrs", extract the hours
    const hoursMatch = message.match(/up to (\d+) hrs/);
    const hours = hoursMatch ? hoursMatch[1] : 'N/A';
    
    // Split message to get a dynamic description (before "up to X hrs")
    const description = hoursMatch ? message.split('up to')[0].trim() : message;
    
    return { description, hours };
  };

  // Extract dynamic content from match.message
  const { description, hours } = extractDetailsFromMessage(match.message);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition-transform transform hover:shadow-lg">
      <div className="flex items-center mb-4">
        <img
          src={match.image}
          alt={match.title || 'Match'}
          className="w-12 h-12 rounded-full mr-4 border border-gray-200"
        />
        <div>
          <h3 className="font-semibold text-lg text-gray-800">{match.title}</h3>
          {/* Use the full message as a subtitle */}
          <p className="text-sm text-gray-500">{match.message}</p>
        </div>
      </div>
      <div className="bg-green-100 py-1 px-3 rounded-lg inline-block mb-4">
        <span className="font-medium text-green-800 text-sm">{match.count} Nearby</span>
      </div>
      {/* Dynamic description and hours based on message */}
      <p className="text-sm text-gray-600 mb-4">
        {description} {hours !== 'N/A' ? `up to ${hours} hrs` : ''}
      </p>
      <div className="flex justify-end">
        <button
          onClick={handleMatchClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
        >
          {match.button}
        </button>
      </div>
    </div>
  );
};

export default MatchCard;