import React, { useState } from 'react';
import MatchDetail from '../../components/Itinerary/ItineraryDetails/MatchDetail';
import { useItinerary } from '../../context/itinerary/ItineraryContext';
import RouteMap from '../../components/Itinerary/Itinerary/RouteMap';
import ItineraryText from '../../components/Itinerary/Itinerary/ItineraryText';

const MatchDetailPage = () => {
  const { itineraryData, loading } = useItinerary();
  const [hoveredFlightCoords, setHoveredFlightCoords] = useState(null);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/5">
            <MatchDetail setHoveredFlightCoords={setHoveredFlightCoords} />
          </div>
          {!loading && itineraryData && (
            <div className="lg:w-2/5 lg:sticky lg:top-6 lg:self-start space-y-6">
              {itineraryData.itineraryResponseNewdata && (
                <ItineraryText itinerary={itineraryData.itineraryResponseNewdata.itinerary} />
              )}
              <RouteMap itineraryData={itineraryData} hoveredFlightCoords={hoveredFlightCoords} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetailPage;