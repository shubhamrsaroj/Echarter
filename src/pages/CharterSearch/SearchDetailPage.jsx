import React from 'react';
import { useSearch } from '../../context/CharterSearch/SearchContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RouteMap from '../../components/common/RouteMap';
import BaseCard from '../../components/CharterSearch/Search/BaseCard';
import BrokerCard from '../../components/CharterSearch/Search/BrokerCard';
import MatchCard from '../../components/CharterSearch/Search/MatchCard';
import DateAdjustment from '../../components/CharterSearch/Search/DateAdjustment';
import ItinerarySearchCard from '../../components/CharterSearch/Search/ItinerarySearchCard';

const ItineraryDetailsPage = () => {
  const { itineraryData, loading } = useSearch();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 relative">
        {/* Back Button & Heading - Arrow Above the Heading */}
        <div className="flex flex-col items-start space-y-1 mb-6">
          <button onClick={() => navigate('/search')} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Option for You</h1>
        </div>

        {/* Main Content Area */}
        {itineraryData && !loading && (
          <div className="flex flex-col lg:flex-row gap-6 relative">
            {/* Left Column: Cards in vertical stack - Scrollable */}
            <div className="lg:w-3/5 space-y-6 pb-6">
              <BrokerCard broker={itineraryData.broker} />
                <MatchCard match={itineraryData.match} />           
                <DateAdjustment adjustment={itineraryData.dateAdjustment} />
                  <BaseCard itineraryData={itineraryData} />
            </div>

            {/* Right Column: Map and Itinerary Text - Sticky without scrolling */}
            <div className="lg:w-2/5 lg:sticky lg:top-6 lg:self-start space-y-6">
              {itineraryData.itineraryResponseNewdata && (
                <ItinerarySearchCard itinerary={itineraryData.itineraryResponseNewdata.itinerary} />
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
