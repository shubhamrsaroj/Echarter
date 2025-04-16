import React, { useState } from 'react';
import { Plane, Info } from 'lucide-react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import InfoModal from '../../common/InfoModal';
import { toast } from 'react-toastify';

const BaseCard = ({ itineraryData = {} }) => {
  const { getCompaniesByCategory, setSelectedBaseOption } = useItinerary();
  const [infoUrl, setInfoUrl] = useState('');
  
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

  const handleInfoClick = (option) => {
    if (!option.infoUrl) {
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
    setInfoUrl(option.infoUrl);
  };
  
  return (
    <>
      <div className="space-y-6">
        {Array.isArray(itineraryData.base) && itineraryData.base.length > 0 && (
          itineraryData.base.map((option, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-b-3 p-6 relative"
            >
              <div className="absolute top-4 right-4 text-right">
                <h3 className="font-semibold text-lg text-black">{option.category}</h3>
                <p className="text-sm text-black">{option.message}</p>
                <div className="flex items-center justify-end mt-2">
                  <button 
                    onClick={() => handleInfoClick(option)}
                    className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                  >
                    <Info className="text-gray-700 ml-1" size={20} />
                  </button>
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
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-black">Flight Time</h4>
                    <span className="font-medium text-black text-sm">
                      {option.totalFlightTime && `${option.totalFlightTime} hrs`}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-black mt-2">Price From</h4>
                  <span className="font-medium text-black text-lg">
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
      {infoUrl && <InfoModal url={infoUrl} onClose={() => setInfoUrl('')} />}
    </>
  );
};

export default BaseCard;