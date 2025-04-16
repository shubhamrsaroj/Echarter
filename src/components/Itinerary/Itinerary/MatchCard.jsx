import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import InfoModal from '../../common/InfoModal';
import { toast } from 'react-toastify';

const MatchCard = ({ match = {} }) => {
  const { getCompaniesByMatch, itineraryData } = useItinerary();
  const [infoUrl, setInfoUrl] = useState('');
  
  // If ids array is empty, don't render the component
  if (!match.ids || match.ids.length === 0) {
    return null;
  }
  
  const handleMatchClick = async () => {
    if (itineraryData) {
      await getCompaniesByMatch(itineraryData);
    }
  };

  const handleInfoClick = () => {
    if (!match.infoUrl) {
      toast.info('No information available at the moment.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    setInfoUrl(match.infoUrl);
  };
  
  return (
    <>
      <div className="bg-white rounded-xl border border-b-3 p-6 relative">
        <div className="absolute top-4 right-4 text-right">
          <h3 className="font-semibold text-lg text-black">{match.title}</h3>
          <p className="text-sm text-black">{match.message}</p>
          <div className="flex items-center justify-end mt-2">
            <button 
              onClick={handleInfoClick}
              className="hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <Info className="text-gray-700 ml-1" size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center mb-2">
          <img
            src={match.image}
            alt="Match"
            className="w-24 h-24 rounded-full border border-gray-200 object-cover"
          />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="bg-[#c1ff72] py-1 px-3 rounded-lg inline-block">
            <span className="font-medium text-black text-sm">
              {match.count} Nearby
            </span>
          </div>
          <button 
            onClick={handleMatchClick}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
          >
            {match.button}
          </button>
        </div>
      </div>
      {infoUrl && <InfoModal url={infoUrl} onClose={() => setInfoUrl('')} />}
    </>
  );
};

export default MatchCard;