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

const ActivityCard = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoUrl, setInfoUrl] = useState('');
  const [chatData, setChatData] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);
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
  const hasRightContent = showDeleteModal || showItinerary || chatData;

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleDeleteClick = (deal) => {
    setSelectedDeal(deal);
    setShowDeleteModal(true);
    setActiveCardId(deal.conversationId);
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

  const handleCalendarClick = (itineraryId, deal) => {
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
        setActiveCardId(deal.conversationId);
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
        conversationId: selectedDeal.conversationId
      });
      
      if (response.success) {
        toast.success(response.message || "Activity deleted successfully");
        fetchDeals();
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
      const newChatData = {
        threadId: deal.threadId,
        acsUserId: deal.acsUserId,
        token: deal.accessToken,
        message: deal.message || deal.sellerName
      };

      // Close other panels
      if (showDeleteModal) {
        setShowDeleteModal(false);
        setSelectedDeal(null);
      }
      if (showItinerary) {
        fetchItinerary(null);
      }

      setChatData(newChatData);
      setActiveCardId(deal.conversationId);
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
              <Info className=" ml-2 cursor-pointer  text-gray-500 hover:text-gray-700" size={25} onClick={handleInfoClick} />
            </div>
            <List className="text-2xl cursor-pointer text-black" size={24} />
          </div>
        </div>
        
        <div className="px-4 lg:px-6 pb-4">
          {deals.map((deal) => (
            <div key={deal.conversationId || deal.threadId} className={`border border-black rounded-lg p-4 lg:p-6 bg-white w-full mb-4 ${
              activeCardId === deal.conversationId
                ? 'ring-2 ring-blue-500 shadow-lg transform scale-[1.02] transition-all'
                : ''
            }`}>
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
                  onClick={() => handleCalendarClick(deal.itineraryId, deal)}
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

      {/* Right half of the page */}
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

          {chatData && (
            <div className="bg-white rounded-lg border border-gray-200 w-full h-[calc(100vh-140px)] overflow-hidden relative">
              <div className="absolute inset-0">
                <CommonChat 
                  chatData={chatData}
                  onClose={handleCloseChat}
                  options={{
                    autoFocus: true,
                    topic: chatData.message,
                    sendBox: {
                      singleLineMode: false
                    }
                  }}
                  fluentTheme={{
                    components: {
                      sendBox: {
                        root: {
                          backgroundColor: '#ffffff',
                          borderTop: '1px solid #e5e7eb',
                          padding: '16px'
                        },
                        input: {
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '14px',
                          color: '#374151'
                        }
                      },
                      sendButton: {
                        root: {
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          '&:hover': {
                            backgroundColor: '#1f2937'
                          }
                        }
                      },
                      messageThread: {
                        container: {
                          backgroundColor: '#ffffff',
                          padding: '20px'
                        },
                        messageContainer: {
                          margin: '8px 0'
                        },
                        message: {
                          bubble: {
                            backgroundColor: '#f3f4f6',
                            borderRadius: '12px',
                            padding: '10px 16px'
                          },
                          mine: {
                            bubble: {
                              backgroundColor: '#000000',
                              color: '#ffffff'
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
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