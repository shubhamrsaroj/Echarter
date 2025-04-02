
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BaseDetail from '../../components/Itinerary/ItineraryDetails/BaseDetail';
import { useItinerary } from '../../context/itinerary/ItineraryContext';
import RouteMap from '../../components/Itinerary/Itinerary/RouteMap';
import ItineraryText from '../../components/Itinerary/Itinerary/ItineraryText';

const BaseDetailPage = () => {
  const navigate = useNavigate();
  const { itineraryData, loading } = useItinerary();

  return (
    <div className="min-h-screen relative">
      {/* Back Arrow - Top Left Corner */}
      <button
        onClick={() => navigate('/itinerary-details')}
        className="absolute top-4 left-6"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="container mx-auto p-6 pt-14"> {/* Added padding to avoid overlap */}
        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: BaseDetail */}
          <div className="lg:w-3/5">
            <BaseDetail />
          </div>

          {/* Right Column: Map and Itinerary Text - Aligned with left section */}
          {!loading && itineraryData && (
            <div className="lg:w-2/5 lg:sticky lg:top-6 space-y-6">
              {itineraryData.itineraryResponseNewdata && (
                <ItineraryText itinerary={itineraryData.itineraryResponseNewdata.itinerary} />
              )}
              <RouteMap itineraryData={itineraryData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseDetailPage;