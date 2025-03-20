import { useItinerary } from '../../context/itinerary/ItineraryContext';
import RouteMap from '../../components/Itinerary/Itinerary/RouteMap';
import ItineraryInput from '../../components/Itinerary/Itinerary/ItineraryInput';
import BaseCard from '../../components/Itinerary/Itinerary/BaseCard';
import BrokerCard from '../../components/Itinerary/Itinerary/BrokerCard';
import MatchCard from '../../components/Itinerary/Itinerary/MatchCard';
import DateAdjustment from '../../components/Itinerary/Itinerary/DateAdjustment'
import ItineraryText from '../../components/Itinerary/Itinerary/ItineraryText';

const ItineraryPage = () => {
  const { itineraryData, loading, error, getItineraryByText } = useItinerary();
  
  const handleItinerarySearch = async (itineraryText) => {
    try {
      await getItineraryByText(itineraryText);
    } catch (err) {
      console.error('Failed to fetch itinerary:', err);
    }
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Flight Itinerary</h1>
        
        {/* Itinerary Input Component */}
        <div className="mb-8">
          <ItineraryInput onSearch={handleItinerarySearch} />
        </div>
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
            {error}
          </div>
        )}
        
        {/* Main Content Area */}
        {itineraryData && !loading && (
          <div className="flex flex-col lg:flex-row gap-6 relative">
            
            {/* Left Column: Map and Itinerary Text - Sticky without scrolling */}
            <div className="lg:w-2/5 lg:sticky lg:top-6 lg:self-start space-y-6">
              {/* Itinerary Text */}
              {itineraryData.itineraryResponseNewdata && (
                <ItineraryText itinerary={itineraryData.itineraryResponseNewdata.itinerary} />
              )}
              
              {/* Route Map */}
              <RouteMap itineraryData={itineraryData} />
            </div>
            
            {/* Right Column: Cards in vertical stack - Scrollable */}
            <div className="lg:w-3/5 space-y-6 pb-6">
              {/* Broker Card */}
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Broker Details</h2>
              <div className="transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
                <BrokerCard broker={itineraryData.broker} />
              </div>
              
              {/* Match Card */}
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Flight Match</h2>
              <div className="transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
                <MatchCard match={itineraryData.match} />
              </div>


                {/* DateAdjustment */}
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Date Adjustment</h2>
              <div className="transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
                <DateAdjustment adjustment={itineraryData.dateAdjustment} />
              </div>
              
              {/* Itinerary Base (Aircraft Options) */}
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Aircraft Options</h2>
              <BaseCard itineraryData={itineraryData} />
              
            
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryPage;