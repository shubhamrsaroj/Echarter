import React, { useState, useEffect } from "react";
import { Trash2, ShieldQuestion, CalendarClock, MessagesSquare, List, Search, Info } from "lucide-react";
import { toast } from "react-toastify";
import ReviewDelete from "../Review/ReviewDelete";
import { useBuyerContext } from "../../../context/buyer/BuyerContext";
import BuyerItinerary from "../Itinerary/BuyerItinerary";
import { useNavigate } from "react-router-dom";
import SkeletonActivityCard from "./SkeletonActivityCard";
import InfoModal from "../../../components/common/InfoModal";
import { getInfoContent } from "../../../api/infoService";

const ActivityCard = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoUrl, setInfoUrl] = useState('');
  const navigate = useNavigate();
  const { 
    loading, 
    deleteConversationWithReview, 
    resetSuccessMessages,
    itineraries,
    loadingItinerary,
    itineraryError,
    fetchItinerary,
    showItinerary,
    deals,
    fetchDeals
  } = useBuyerContext();

  // Check if right panel has content
  const hasRightContent = showDeleteModal || showItinerary;

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleDeleteClick = (deal) => {
    setSelectedDeal(deal);
    setShowDeleteModal(true);
    // Close itinerary view if open
    if (showItinerary) {
      fetchItinerary(null);
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteModal(false);
    setSelectedDeal(null);
    resetSuccessMessages();
  };

  const handleCalendarClick = (itineraryId) => {
    if (itineraryId) {
      // Close delete modal if open
      if (showDeleteModal) {
        setShowDeleteModal(false);
        setSelectedDeal(null);
      }
      
      if (showItinerary === itineraryId) {
        // If the same itinerary is already showing, close it
        fetchItinerary(null); // Reset the itinerary
      } else {
        // Show a different itinerary
        fetchItinerary(itineraryId);
      }
    }
  };

  const handleCloseItinerary = () => {
    fetchItinerary(null); // Reset the itinerary
  };

  const handleSubmitDelete = async (data) => {
    if (!selectedDeal) return;
    
    try {
      const response = await deleteConversationWithReview({
        rating: data.rating,
        feedback: data.feedback,
        worked: data.worked,
        conversationId: selectedDeal.conversationId
      });
      
      if (response.success) {
        toast.success(response.message || "Activity deleted successfully");
        fetchDeals(); // Refresh the deals list
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

  const handleOpenConnect = async (dealId) => {
    const deal = deals.find(
      (d) =>
        d.conversationId === dealId ||
        d.threadId === dealId ||
        d.itineraryId === dealId
    );
    if (!deal || !deal.threadId || !deal.acsUserId || !deal.accessToken) return;

    try {
      setIsConnecting(true);
      const chatData = {
        threadId: deal.threadId,
        acsUserId: deal.acsUserId,
        token: deal.accessToken,
      };

      console.log(chatData);

      navigate('/chat', { state: { chatData } });
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error("Failed to open chat", {
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
      
      // If we successfully got a URL, show the modal
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

  if (loading && deals.length === 0) {
    return <SkeletonActivityCard />;
  }

  return (
    <div className={`flex flex-col lg:flex-row h-[calc(96vh-60px)] ${!hasRightContent ? "overflow-y-auto" : ""}`}>
      {/* Left half of the page - Only scrolls when right content is present */}
      <div className={`w-full lg:w-1/2 ${hasRightContent ? "overflow-y-auto" : ""}`}>
        <div className="px-4 lg:px-6 py-4 bg-white z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center -mt-2">
              <h1 className="text-xl font-bold text-black">Activity</h1>
              <Info className="w-5 h-5 ml-2 cursor-pointer text-black" onClick={handleInfoClick} />
            </div>
            <List className="text-2xl cursor-pointer text-black" size={24} />
          </div>
        </div>
        
        <div className="px-4 lg:px-6 pb-4">
          {deals.map((deal) => (
            <div key={deal.conversationId || deal.threadId} className="border border-black rounded-lg p-4 lg:p-6 bg-white w-full mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                  <h2 className="text-xl font-bold mb-1 text-black">{deal?.sellerName}</h2>
                  <p className="text-black mb-1">{deal?.itineraryFromTo}</p>
                  <p className="text-black text-sm">{deal?.message}</p>
                </div>
                
                <div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-end">
                  {!deal.sellerInitiation && deal.threadId && (
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#c1ff72] cursor-pointer ${isConnecting ? 'opacity-50' : ''}`}
                        onClick={() => handleOpenConnect(deal.conversationId || deal.threadId || deal.itineraryId)}
                      >
                        <MessagesSquare size={20} className="text-black" />
                      </div>
                      <span className="text-xs mt-1 text-black text-center">{isConnecting ? 'Connecting...' : deal.status || "Open"}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white border border-gray-300">
                      <Search size={20} className="text-black" />
                    </div>
                    <span className="text-xs mt-1 text-black text-center">More Option</span>
                  </div>
                </div>
              </div>
              
              <div className="flex mt-6 gap-5">
                <Trash2 
                  size={22} 
                  className="text-black cursor-pointer hover:text-red-500" 
                  onClick={() => handleDeleteClick(deal)} 
                />
                <ShieldQuestion size={22} className="text-black" />
                <CalendarClock 
                  size={22} 
                  className="text-black cursor-pointer hover:text-gray-700" 
                  onClick={() => handleCalendarClick(deal.itineraryId)}
                />
              </div>
            </div>
          ))}

          {deals.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No activities found
            </div>
          )}
          <div className="pb-8"></div>
        </div>
      </div>

      {/* Right half of the page - Only shown when needed */}
      {hasRightContent && (
        <div className="w-full lg:w-1/2 px-4 lg:px-6 py-4 flex items-start overflow-hidden">
          {showDeleteModal && (
            <div className="bg-white rounded-lg w-full">
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
            <div className="bg-white rounded-lg w-full">
              <BuyerItinerary
                itinerary={itineraries[showItinerary] || []}
                loading={loadingItinerary}
                error={itineraryError}
                onClose={handleCloseItinerary}
              />
            </div>
          )}
        </div>
      )}

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