import React from 'react';
import { Info } from 'lucide-react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';

const MatchCard = ({ match = {} }) => {
  const { getCompaniesByMatch, itineraryData } = useItinerary();

  const handleMatchClick = async () => {
    if (itineraryData) {
      await getCompaniesByMatch(itineraryData);
    }
  };



  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition-transform transform hover:shadow-lg relative">
      <div className="absolute top-4 right-4 text-right">
        <h3 className="font-semibold text-lg text-gray-800">{match.title || 'Unknown Match'}</h3>
        <p className="text-sm text-gray-500">{match.message || 'No message available'}</p>
        <div className="flex items-center justify-end mt-2">
          <Info className="text-blue-500 ml-1" size={16} />
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <img 
          src={match.image || ''} 
          alt="Match" 
          className="w-16 h-16 rounded-full border border-gray-200"
        />
      </div>
      
      <div className="flex items-center justify-between mt-10">
        <div className="bg-[#ffde59] py-1 px-3 rounded-lg inline-block">
          <span className="font-medium text-black text-sm">
            {match.count ? `${match.count} Nearby` : 'No Nearby Matches'}
          </span>
        </div>
        <button 
          onClick={handleMatchClick} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
        >
          {match.button || 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default MatchCard;