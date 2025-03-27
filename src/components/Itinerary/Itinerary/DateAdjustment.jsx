import React from 'react';
import { Info } from 'lucide-react';
import { useItinerary } from '../../../context/itinerary/ItineraryContext';

const DateAdjustment = ({ adjustment = {} }) => {
  const { getCompaniesByDateAdjustment, itineraryData } = useItinerary();

  const handleDateAdjustmentClick = async () => {
    if (itineraryData) {
      await getCompaniesByDateAdjustment(itineraryData);
    }
  };



  return (
    <div className="bg-white rounded-xl border border-b-3 p-6 relative">
      <div className="absolute top-4 right-4 text-right">
        <h3 className="font-semibold text-lg text-gray-800">{adjustment.title || 'Unknown Adjustment'}</h3>
        <p className="text-sm text-gray-500">{adjustment.message || 'No message available'}</p>
        <div className="flex items-center justify-end mt-2">
          <Info className="text-gray-700 ml-1" size={20} />
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <img 
          src={adjustment.image || ''} 
          alt="Adjustment" 
          className="w-16 h-16 rounded-full border border-gray-200"
        />
      </div>
      
      <div className="flex items-center justify-between mt-10">
        <div className="bg-[#c1ff72] py-1 px-3 rounded-lg inline-block">
          <span className="font-medium text-black text-sm">
            {adjustment.count ? `${adjustment.count} Nearby` : 'No Nearby Adjustments'}
          </span>
        </div>
        <button 
          onClick={handleDateAdjustmentClick} 
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all"
        >
          {adjustment.button || 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default DateAdjustment;