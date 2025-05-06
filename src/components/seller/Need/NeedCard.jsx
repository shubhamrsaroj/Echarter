import React, { useEffect, useState, useRef } from "react";
import { MessageSquareDot, Info } from "lucide-react";
import RibbonIcon from "../../../assets/icons.png";
import { useSellerContext } from "../../../context/seller/SellerContext"; 
import SkeletonNeedCard from "./SkeletonNeedCard";
import NeedItinerary from "./NeedItinerary"; 
import NeedChat from "./NeedChat";
import InfoModal from "../../common/InfoModal";
import { getInfoContent } from "../../../api/infoService";
import { toast } from "react-toastify";
import RouteMap from "../../common/RouteMap";

const NeedCard = () => {
  const { 
    currentUser, 
    fetchItinerary, 
    itineraries, 
    loadingItinerary, 
    itineraryError,
    resetItineraryCache,
    loading: globalLoading,
  } = useSellerContext();

  const [selectedItineraryId, setSelectedItineraryId] = useState(null);
  const [infoUrl, setInfoUrl] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [chatData, setChatData] = useState(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const clickTimeoutRef = useRef(null);
  
  // Previous itineraries ref to compare
  const prevItinerariesRef = useRef({});

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      // Clean up any ongoing requests when component unmounts
      resetItineraryCache();
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [resetItineraryCache]);

  // Fetch itineraries for company when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser?.comId) {
      // Always show loading on first mount or user change
      setIsFirstLoad(true);
      setLocalLoading(true);
      
      if (!initialLoadComplete) {
        // Use the new fetchItinerary with companyId and days parameters
        fetchItinerary(currentUser.comId, 30)
          .finally(() => {
            setIsFirstLoad(false);
            setInitialLoadComplete(true);
          });
      }
    }
  }, [currentUser?.comId, fetchItinerary, initialLoadComplete]);

  // Monitor for data changes and update loading state
  useEffect(() => {
    const companyKey = currentUser?.comId ? `company_${currentUser.comId}` : null;
    
    // If we have the itineraries data and it's an array (actual data not just an empty object)
    if (companyKey && itineraries[companyKey] && Array.isArray(itineraries[companyKey])) {
      // Data has arrived, turn off loading
      setLocalLoading(false);
      
      // Update the reference for future comparisons
      prevItinerariesRef.current[companyKey] = itineraries[companyKey];
    }
  }, [itineraries, currentUser?.comId]);

  // Handle info click
  const handleInfoClick = async () => {
    try {
      setLoadingInfo(true);
      const url = await getInfoContent('needs', 'info');
      setInfoUrl(url);
    } catch (error) {
      console.error('Failed to fetch info:', error);
      toast.info(error.message || "Failed to load information", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingInfo(false);
    }
  };

  // Use itineraries from company fetch
  const companyKey = currentUser?.comId ? `company_${currentUser.comId}` : null;
  
  // Check if itineraries data is loaded
  const isDataLoaded = companyKey && 
                       itineraries[companyKey] && 
                       Array.isArray(itineraries[companyKey]);
  
  const apiNeeds = isDataLoaded ? itineraries[companyKey] : [];
  
  // Map API response to match expected fields
  const displayNeeds = apiNeeds.map(need => ({
    id: need.itineraryID,
    buyerName: need.buyerName,
    itineraryFromTo: need.itineraryFromTo,
    itineraryText: need.itineraryText,
    buyerTag: need.buyerTag,
    allowDelete: true,
    activeConversations: need.activeConversations,
    sellerInitiation: true,
    allowDecline: true,
  }));

  // Show loading state in these conditions:
  // 1. First load is in progress
  // 2. Local loading state is true
  // 3. Global loading is true and we haven't completed initial load
  // 4. We have a company ID but data isn't loaded yet
  const isLoading = 
    isFirstLoad || 
    localLoading || 
    (globalLoading && !initialLoadComplete) ||
    (currentUser?.comId && !isDataLoaded);

  if (isLoading) {
    return <SkeletonNeedCard />;
  }

  // Handle Initiate button click with debounce
  const handleInitiateClick = (itineraryId) => {
    // Prevent rapid double-clicks
    if (isInitiating) {
      return;
    }
    
    // Check if it's the same itinerary we already have selected
    if (itineraryId === selectedItineraryId) {
      return;
    }
    
    setIsInitiating(true);
    setSelectedItineraryId(itineraryId);
    // Use fetchItinerary with single itineraryId parameter
    fetchItinerary(itineraryId);
    
    // Clear any existing timeout before setting a new one
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Set a timeout to allow the next click
    clickTimeoutRef.current = setTimeout(() => {
      setIsInitiating(false);
    }, 1000); // 1 second debounce
  };

  // Close itinerary handler
  const handleCloseItinerary = () => {
    setSelectedItineraryId(null);
  };

  const handleConnect = (data) => {
    console.log('NeedCard - connecting with data:', data);
    setChatData(data);
  };

  const handleCloseChat = () => {
    setChatData(null);
  };

  // Create route map data from itinerary
  const getRouteMapData = () => {
    if (!selectedItineraryId || !itineraries[selectedItineraryId] || !itineraries[selectedItineraryId].itinerary) {
      return null;
    }

    return {
      flights: itineraries[selectedItineraryId].itinerary.map(leg => ({
        from: leg.departurePlace,
        to: leg.arrivalPlace,
        fromCoordinates: {
          lat: parseFloat(leg.departureLatitude),
          long: parseFloat(leg.departureLongitude)
        },
        toCoordinates: {
          lat: parseFloat(leg.arrivalLatitude),
          long: parseFloat(leg.arrivalLongitude)
        },
        fromCity: leg.departurePlace,
        toCity: leg.arrivalPlace
      }))
    };
  };

  return (
    <div className="flex flex-col md:flex-row w-full -mt-4">
      {/* Left Side: Need List */}
      <div className="w-full md:w-1/2 p-4">
        <div className="flex items-center space-x-1 text-2xl font-bold pb-2 text-black">
          <span>Needs</span>
          <Info 
            size={25} 
            className={`text-gray-500  cursor-pointer ml-4 ${loadingInfo ? 'animate-pulse' : ''}`}
            onClick={handleInfoClick}
          />
        </div>
        {itineraryError && !selectedItineraryId ? (
          <div className="text-red-500 p-4 rounded-lg bg-red-50 border border-red-200">
            {itineraryError}
          </div>
        ) : displayNeeds.length === 0 ? (
          <div className="text-gray-500 p-4 rounded-lg bg-gray-50 border border-gray-200">
            No needs are currently available for your company.
          </div>
        ) : (
          displayNeeds.map((need) => (
            <React.Fragment key={need.id}>
              {/* Ribbon Icon - Positioned outside and overlapping into card */}
              {need.buyerTag && (
                <div className="relative z-10 h-0">
                  <div className="absolute -right-1 -top-11">
                    <img src={RibbonIcon} alt="Ribbon Icon" className="w-22 h-28" />
                  </div>
                </div>
              )}
              <div
                className={`border border-black rounded-lg relative p-4 mb-4 overflow-hidden z-20 ${
                  selectedItineraryId === need.id
                   ? 'ring-2 ring-black bg-blue-50 shadow-lg transform scale-[1.02] transition-all'
                : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-16">
                    <div className="text-xl font-semibold text-black">{need.buyerName}</div>
                    <div className="text-black mt-2 mb-4">{need.itineraryText}</div>

                    {need.activeConversations > 0 && (
                      <div className="text-red-600 mt-2">
                         <span>Talking to</span>{" "}
                           {`${need.activeConversations}`} 
                           <span> Others</span> 
                        </div>
                       )}

                  </div>
                  
                  {/* Initiate Button with disabled state */}
                  <div className="flex flex-col items-center mr-12 mt-2 relative z-20">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isInitiating
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
                      }`}
                      onClick={() => !isInitiating && handleInitiateClick(need.id)}
                    >
                      <MessageSquareDot size={24} className="text-black" />
                    </div>
                    <span className="text-xs text-black mt-1">
                      {isInitiating && selectedItineraryId === need.id ? "Loading..." : "Initiate"}
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>

      {/* Right Side: Itinerary and Route Map Display - Updated with sticky positioning */}
      <div className="w-full md:w-1/2 p-4 mt-2 md:mt-8">
        {selectedItineraryId && (
          <div className="lg:sticky lg:top-6 space-y-4">
            {chatData ? (
              <NeedChat 
                chatData={chatData} 
                onClose={handleCloseChat}
              />
            ) : (
              <>
                {/* NeedItinerary Component */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <NeedItinerary
                    itinerary={itineraries[selectedItineraryId] || []}
                    loading={loadingItinerary}
                    error={itineraryError}
                    onClose={handleCloseItinerary}
                    selectedItineraryId={selectedItineraryId}
                    onConnect={handleConnect}
                    buyerName={displayNeeds.find(need => need.id === selectedItineraryId)?.buyerName}
                  />
                </div>

                {/* RouteMap Component */}
                {itineraries[selectedItineraryId] && itineraries[selectedItineraryId].itinerary && (
                  <RouteMap
                    itineraryData={getRouteMapData()}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Info Modal */}
      {infoUrl && (
        <InfoModal
          url={infoUrl}
          onClose={() => setInfoUrl(null)}
        />
      )}
    </div>
  );
};

export default NeedCard;