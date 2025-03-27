import React from 'react';
import BaseDetail from '../../components/Itinerary/ItineraryDetails/BaseDetail';
import { useItinerary } from '../../context/itinerary/ItineraryContext';
import RouteMap from '../../components/Itinerary/Itinerary/RouteMap';
import ItineraryText from '../../components/Itinerary/Itinerary/ItineraryText';

const BaseDetailPage = () => {
  const { itineraryData, loading } = useItinerary();

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-6">
        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: BaseDetail */}
          <div className="lg:w-3/5">
            <BaseDetail />
          </div>

          {/* Right Column: Map and Itinerary Text - Sticky without scrolling */}
          {!loading && itineraryData && (
            <div className="lg:w-2/5 lg:sticky lg:top-6 lg:self-start space-y-6">
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