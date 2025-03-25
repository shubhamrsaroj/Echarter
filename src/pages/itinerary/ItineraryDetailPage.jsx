import React from 'react';
import { useItinerary } from '../../context/itinerary/ItineraryContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RouteMap from '../../components/Itinerary/Itinerary/RouteMap';
import BaseCard from '../../components/Itinerary/Itinerary/BaseCard';
import BrokerCard from '../../components/Itinerary/Itinerary/BrokerCard';
import MatchCard from '../../components/Itinerary/Itinerary/MatchCard';
import DateAdjustment from '../../components/Itinerary/Itinerary/DateAdjustment';
import ItineraryText from '../../components/Itinerary/Itinerary/ItineraryText';

const ItineraryDetailsPage = () => {
  const { itineraryData, loading } = useItinerary();
  const navigate = useNavigate();

  return (
    <div className="overflow-y-hidden">
      <div className="container mx-auto p-6 relative">
        {/* Back Button & Heading - Arrow Above the Heading */}
        <div className="flex flex-col items-start space-y-1 mb-6">
          <button onClick={() => navigate('/itinerary')} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Option for You</h1>
        </div>

        {/* Main Content Area */}
        {itineraryData && !loading && (
          <div className="flex flex-col lg:flex-row gap-6 relative">
            {/* Left Column: Cards in vertical stack - Scrollable */}
            <div className="lg:w-3/5 space-y-6 pb-6">
              <div className="transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
                <BrokerCard broker={itineraryData.broker} />
              </div>
              <div className="transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
                <MatchCard match={itineraryData.match} />
              </div>
              <div className="transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
                <DateAdjustment adjustment={itineraryData.dateAdjustment} />
              </div>
              <BaseCard itineraryData={itineraryData} />
            </div>

            {/* Right Column: Map and Itinerary Text - Sticky without scrolling */}
            <div className="lg:w-2/5 lg:sticky lg:top-6 lg:self-start space-y-6">
              {itineraryData.itineraryResponseNewdata && (
                <ItineraryText itinerary={itineraryData.itineraryResponseNewdata.itinerary} />
              )}
              <RouteMap itineraryData={itineraryData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryDetailsPage;
