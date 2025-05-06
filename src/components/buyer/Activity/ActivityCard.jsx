import React, { useState, useEffect } from "react";
import { Trash2, ShieldQuestion, CalendarClock, MessagesSquare, List, Search, Info } from "lucide-react";
import { toast } from "react-toastify";
import ReviewDelete from "../Review/ReviewDelete";
import { useBuyerContext } from "../../../context/buyer/BuyerContext";
import BuyerItinerary from "../Itinerary/BuyerItinerary";
import CommonChat from "../../../components/common/CommonChat";
import InfoModal from "../../../components/common/InfoModal";
import { getInfoContent } from "../../../api/infoService";
import SkeletonActivityCard from "./SkeletonActivityCard";
import { AcsService } from "../../../api/Acs/AcsService";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../../context/CharterSearch/SearchContext";
import RouteMap from "../../common/RouteMap";

const ActivityCard = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoUrl, setInfoUrl] = useState('');
  const [chatData, setChatData] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);
  const [searchingActivities, setSearchingActivities] = useState({});
  const { 
    loading, 
    deleteConversationWithReview, 
    resetSuccessMessages,
    itineraries,
    loadingItinerary,
    itineraryError,
    fetchItinerary,
    showItinerary,
    deals: activities,
    fetchDeals: fetchActivities
  } = useBuyerContext();
  const navigate = useNavigate();
  const { getOptionsByItineraryId } = useSearch();

  // Check if right panel has content
  const hasRightContent = showDeleteModal || showItinerary || chatData;

  // Track if component is mounted
  const isMounted = React.useRef(true);

  useEffect(() => {
    // Set up mounting state
    isMounted.current = true;
    
    // Only fetch if component is mounted
    if (isMounted.current) {
      fetchActivities();
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [fetchActivities]); // Empty dependency array to run only once




  const handleDeleteClick = (activity) => {
    setSelectedDeal(activity);
    setShowDeleteModal(true);
    setActiveCardId(activity.conversationId);
    // Close other panels
    if (showItinerary) {
      fetchItinerary(null);
    }
    setChatData(null);
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setSelectedDeal(null);
    setActiveCardId(null);
    resetSuccessMessages();
  };

  const handleCalendarClick = (itineraryId, activity) => {
    if (itineraryId) {
      // Close other panels
      if (showDeleteModal) {
        setShowDeleteModal(false);
        setSelectedDeal(null);
      }
      setChatData(null);
      
      if (showItinerary === itineraryId) {
        fetchItinerary(null);
        setActiveCardId(null);
      } else {
        fetchItinerary(itineraryId);
        setActiveCardId(activity.conversationId);
      }
    }
  };

  const handleCloseItinerary = () => {
    fetchItinerary(null);
    setActiveCardId(null);
  };

  const handleCloseChat = () => {
    setChatData(null);
    setActiveCardId(null);
  };

  const handleSubmitDelete = async (data) => {
    if (!selectedDeal) return;
    
    try {
      const response = await deleteConversationWithReview({
        rating: data.rating,
        feedback: data.feedback,
        worked: data.worked,
        conversationId: selectedDeal.conversationId,
        sellerCompanyId: selectedDeal.sellerCompanyId,
        path: data.path || selectedDeal.path || "Delete"
      });
      
      if (response.success) {
        toast.success(response.message || "Activity deleted successfully");
        fetchActivities();
        setShowDeleteModal(false);
        setSelectedDeal(null);
      } else {
        toast.info(response.message || "No changes were made");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete activity";
      toast.error(errorMessage);
    }
  };

  // Handle itinerary click from chat
  const handleItineraryClickFromChat = (itineraryId, isInternalHandling = false) => {
    if (itineraryId) {
      // If handling internally within the chat, just fetch the data but don't show the panel
      if (isInternalHandling) {
        if (!itineraries[itineraryId]) {
          // Only fetch data, don't show the side panel
          fetchItinerary(itineraryId, false); // Added parameter to indicate don't show UI
        }
        return;
      }
      
      // Normal external handling - show the itinerary panel
      if (showDeleteModal) {
        setShowDeleteModal(false);
        setSelectedDeal(null);
      }
      setChatData(null);
      
      fetchItinerary(itineraryId);
      setActiveCardId(null);
    }
  };

  // When opening chat, include itineraryId
  const handleOpenConnect = async (activityId) => {
    const activity = activities.find(
      (activity) =>
        activity.conversationId === activityId ||
        activity.threadId === activityId ||
        activity.itineraryId === activityId
    );
    if (!activity || !activity.threadId) return;

    try {
      setIsConnecting(true);
      
      // Check ACS Token Validity using JWT validation
      let newChatData;
      const isTokenValid = activity.accessToken && AcsService.isTokenValid(activity.accessToken);
      
      if (isTokenValid) {
        // Valid token path
        console.log('Using existing ACS token - JWT is still valid');
        newChatData = {
          threadId: activity.threadId,
          acsUserId: activity.acsUserId,
          token: activity.accessToken,
          message: activity.sellerName,
          itineraryId: activity.itineraryId, // Add itineraryId
          conversationId: activity.conversationId, // Add conversationId
          sellerCompanyId: activity.sellerCompanyId // Add sellerCompanyId
        };
      } else {
        // Invalid token path - Call API to refresh ACS token
        console.log('Token invalid or expired, requesting new token from /api/SinglePoint/GetRefreshedAcsToken');
        const refreshedData = await AcsService.getRefreshedAcsToken();
        
        if (!refreshedData || !refreshedData.token) {
          throw new Error('Failed to refresh ACS token');
        }
        
        newChatData = {
          threadId: activity.threadId, // Use existing threadId from the activity
          acsUserId: refreshedData.acsUserId,
          token: refreshedData.token,
          message: activity.sellerName,
          itineraryId: activity.itineraryId, // Add itineraryId
          conversationId: activity.conversationId, // Add conversationId
          sellerCompanyId: activity.sellerCompanyId // Add sellerCompanyId
        };
      }

      // Close other panels
      if (showDeleteModal) {
        setShowDeleteModal(false);
        setSelectedDeal(null);
      }
      if (showItinerary) {
        fetchItinerary(null);
      }

      setChatData(newChatData);
      setActiveCardId(activity.conversationId);
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error("Failed to open chat: " + (error.message || "Unknown error"), {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInfoClick = async () => {
    try {
      const url = await getInfoContent('Activity', 'info');
      setInfoUrl(url);
      setShowInfoModal(true);
    } catch (error) {
      console.error('Failed to fetch info content:', error);
      toast.info(error.message || "Failed to fetch information.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSearchOption = async (activity) => {
    if (!activity?.itineraryId) return;
    
    try {
      setSearchingActivities(prev => ({ ...prev, [activity.conversationId]: true }));
      const response = await getOptionsByItineraryId(activity.itineraryId);
      if (response?.itineraryResponseNewdata?.itinerary) {
        navigate('/search-details');
      } else {
        toast.error("No results found for this itinerary");
      }
    } catch (err) {
      console.error('Failed to fetch itinerary options:', err);
      toast.error("Failed to search itinerary options");
    } finally {
      setSearchingActivities(prev => ({ ...prev, [activity.conversationId]: false }));
    }
  };

  if (loading && activities.length === 0) {
    return <SkeletonActivityCard />;
  }

  return (
    <div className={`flex flex-col lg:flex-row h-full`}>
      {/* Left half of the page */}
      <div className={`w-full lg:w-1/2 overflow-y-auto ${(hasRightContent || Object.values(searchingActivities).some(Boolean)) ? "h-[calc(100vh-4rem)]" : "min-h-full"}`}>
        {/* Activity Cards Container - Including header in scroll */}
        <div className="px-4 lg:px-6">
          {/* Header */}
          <div className="py-4 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center -mt-2">
                <h1 className="text-xl font-bold text-black">Activity</h1>
                <Info className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700" size={25} onClick={handleInfoClick} />
              </div>
              <List className="text-2xl cursor-pointer text-black" size={24} />
            </div>
          </div>
          
          {/* Activity Cards */}
          <div className="pb-4">
            {activities.map((activity) => (
              <div key={activity.conversationId || activity.threadId} className={`border border-black rounded-lg p-4 lg:p-6 w-full mb-4 ${
                activeCardId === activity.conversationId
                  ? 'ring-2 ring-black bg-blue-50 shadow-lg transform scale-[1.02] transition-all'
                  : 'bg-white'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                  <div className="w-full sm:w-auto">
                    <h2 className="text-xl font-bold mb-1 text-black">{activity?.sellerName}</h2>
                    <p className="text-black mb-1">{activity?.itineraryFromTo}</p>
                    <p className="text-black text-sm">{activity?.message}</p>
                  </div>
                  
                  <div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-end">
                    {!activity.sellerInitiation && activity.threadId && (
                      <div className="flex flex-col items-center">
                        <div 
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#c1ff72] cursor-pointer ${isConnecting ? 'opacity-50' : ''}`}
                          onClick={() => handleOpenConnect(activity.conversationId || activity.threadId || activity.itineraryId)}
                        >
                          <MessagesSquare size={20} className="text-black" />
                        </div>
                        <span className="text-xs mt-1 text-black text-center">{isConnecting ? 'Connecting...' : activity.status || "Open"}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white border border-gray-300 cursor-pointer hover:bg-gray-100 ${searchingActivities[activity.conversationId] ? 'opacity-50' : ''}`}
                        onClick={() => !searchingActivities[activity.conversationId] && handleSearchOption(activity)}
                      >
                        <Search size={20} className="text-black" />
                      </div>
                      <span className="text-xs mt-1 text-black text-center">{searchingActivities[activity.conversationId] ? 'Searching...' : 'More Option'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex mt-6 gap-5">
                  <Trash2 
                    size={22} 
                    className="text-black cursor-pointer hover:text-red-500" 
                    onClick={() => handleDeleteClick(activity)} 
                  />
                  <ShieldQuestion size={22} className="text-black" />
                  <CalendarClock 
                    size={22} 
                    className="text-black cursor-pointer hover:text-gray-700" 
                    onClick={() => handleCalendarClick(activity.itineraryId, activity)}
                  />
                </div>
              </div>
            ))}

            {activities.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No activities found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right half of the page */}
      <div className={`w-full lg:w-1/2 ${(hasRightContent || Object.values(searchingActivities).some(Boolean)) ? "h-[calc(100vh-4rem)]" : "hidden lg:block"}`}>
        <div className="h-full px-4 lg:px-6 py-4 relative">
          {/* Loading overlay only when searching */}
          {Object.values(searchingActivities).some(Boolean) && (
            <div className="absolute inset-0 z-50 bg-white bg-opacity-80 rounded-lg">
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
                  <p className="mt-4 text-lg font-medium text-gray-800">
                    Please wait
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Only show content if there's something to show */}
          {hasRightContent && (
            <>
              {showDeleteModal && (
                <div className="bg-white rounded-lg w-full h-full overflow-y-auto">
                  <ReviewDelete
                    dealSellerName={selectedDeal?.sellerName}
                    conversationId={selectedDeal?.conversationId}
                    onClose={handleCloseDelete}
                    onSubmit={handleSubmitDelete}
                    isSubmitting={loading}
                  />
                </div>
              )}
              
              {showItinerary && (
                <div className="bg-white w-full h-full">
                  <div className="flex flex-col h-full">
                    {/* Itinerary Section - Fixed height */}
                    <div className="bg-[#f6f6f6] rounded-xl border border-black p-4 md:p-6 w-full mb-4">
                      <BuyerItinerary
                        itinerary={itineraries[showItinerary] || []}
                        loading={loadingItinerary}
                        error={itineraryError}
                        onClose={handleCloseItinerary}
                      />
                    </div>

                    {/* Route Map Section - Takes remaining height */}
                    <div className="h-[50%] min-h-[300px] mb-8">
                      {itineraries[showItinerary] && itineraries[showItinerary].itinerary && (
                        <RouteMap
                          itineraryData={{
                            flights: itineraries[showItinerary].itinerary.map(leg => ({
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
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {chatData && (
                <div className="bg-white rounded-lg border border-gray-200 w-full h-full overflow-hidden relative">
                  <div className="absolute inset-0">
                    <CommonChat 
                      chatData={chatData}
                      onClose={handleCloseChat}
                      onItineraryClick={handleItineraryClickFromChat}
                      itineraryData={chatData?.itineraryId ? itineraries[chatData.itineraryId] : null}
                      itineraryType="buyer"
                      disableDefaultItinerary={false}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showInfoModal && (
        <InfoModal
          url={infoUrl}
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </div>
  );
};

export default ActivityCard;