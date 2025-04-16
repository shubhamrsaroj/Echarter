import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';
import InfoModal from '../../common/InfoModal';
import { toast } from 'react-toastify';

const BrokerCard = ({ broker = {} }) => {
  const { getCompaniesByBroker, itineraryData } = useItinerary();
  const [infoUrl, setInfoUrl] = useState('');
  
  // If ids array is empty, don't render the component
  if (!broker.ids || broker.ids.length === 0) {
    return null;
  }
  
  const handleBrokerClick = async () => {
    if (itineraryData) {
      await getCompaniesByBroker(itineraryData);
    }
  };

  const handleInfoClick = () => {
    if (!broker.infoUrl) {
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
    setInfoUrl(broker.infoUrl);
  };
  
  return (
    <>
      <div className="bg-white rounded-xl border border-b-3 p-6 relative">
        <div className="absolute top-4 right-4 text-right">
          <h3 className="font-semibold text-lg text-black">{broker.title}</h3>
          <p className="text-sm text-black mb-1">{broker.message}</p>
          <p className="text-sm text-gray-700 mb-1 ml-[120px]">{itineraryData.itineraryResponseNewdata.brokers_recommendation}</p>
          <div className="flex justify-end">
            <button
              onClick={handleInfoClick}
              className="hover:bg-gray-100 p-1 sm:p-2 rounded-full transition-colors"
            >
              <Info className="text-gray-700 w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center mb-2">
          <img
            src={broker.image}
            alt="Broker"
            className="w-24 h-24 rounded-full border border-gray-200 object-cover"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="bg-[#c1ff72] py-1 px-3 rounded-lg inline-block">
            <span className="font-medium text-black text-sm">
              {broker.count} Nearby
            </span>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBrokerClick}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all mt-12"
            >
              {broker.button}
            </button>
          </div>
        </div>
      </div>
      {infoUrl && <InfoModal url={infoUrl} onClose={() => setInfoUrl('')} />}
    </>
  );
};

export default BrokerCard;