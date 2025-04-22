

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BrokerDetail from '../../components/CharterSearch/SearchDetails/BrokerDetail';
import { useSearch } from '../../context/CharterSearch/SearchContext';
import RouteMap from '../../components/common/RouteMap';
import ItinerarySearchCard from '../../components/CharterSearch/Search/ItinerarySearchCard';

const BrokerDetailPage = () => {
  const navigate = useNavigate();
  const { itineraryData, loading, setLoading } = useSearch();

  const handleBackClick = () => {
    setLoading(false); // Reset loading before navigating back
    navigate('/search-details');
  };

  return (
    <div className="min-h-screen relative">
      {/* Back Arrow - Top Left Corner */}
      <button onClick={handleBackClick} className="absolute top-4 left-6">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="container mx-auto p-6 pt-14">
        {/* Added padding to avoid overlap */}
        {/* Main Content Area */}
        <div className="flex flex-col gap-6 items-start lg:flex-row">
          {/* Left Column: BrokerDetail */}
          <div className="w-full lg:w-3/5">
            <BrokerDetail />
          </div>
          {/* Right Column: Map and Itinerary Text - Responsive Layout */}
          {!loading && itineraryData && (
            <div className="w-full lg:w-2/5 space-y-6 lg:sticky lg:top-6">
              {itineraryData.itineraryResponseNewdata && (
                <ItinerarySearchCard itinerary={itineraryData.itineraryResponseNewdata.itinerary} />
              )}
              <RouteMap itineraryData={itineraryData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerDetailPage;
