import React, { useState, useEffect } from "react";
import { ShieldQuestion, Trash2, CalendarClock, Copy, MessagesSquare, MessageSquareDot, ThumbsDown, Info } from "lucide-react";
import { useSellerContext } from "../../../context/seller/SellerContext";
import { useNavigate } from "react-router-dom";
import SkeletonDealCard from "./SkeletonDealCard";
import DealItinerary from "./DealItinerary";
import ReviewDecline from "../Review/ReviewDecline";
import ReviewDelete from "../Review/ReviewDelete";
import { toast } from "react-toastify";
import RibbonIcon from "../../../assets/icons.png"; 
import CommonChat from "../../../components/common/CommonChat";
import { AcsService } from "../../../api/Acs/AcsService"; 
import InfoModal from "../../../components/common/InfoModal";
import { getInfoContent } from "../../../api/infoService";
import RouteMap from "../../common/RouteMap";

const DealCard = () => {
  const {
    deals,
    fetchDeals,
    loading: contextLoading,
    currentUser,
    fetchItinerary,
    itineraries,
    loadingItinerary,
    itineraryError,
    resetItineraryState,
    deleteConversationWithReview,
  } = useSellerContext();

  // Add a local loading state to ensure proper visual feedback
  const [localLoading, setLocalLoading] = useState(true);
  
  // Combine context loading with local loading
  const loading = contextLoading || localLoading;

  const navigate = useNavigate();

  const [visibleItineraryId, setVisibleItineraryId] = useState(null);
  const [declineDealId, setDeclineDealId] = useState(null);
  const [deleteDealId, setDeleteDealId] = useState(null);
  const [declineInProgress, setDeclineInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [chatData, setChatData] = useState(null); // Added for chat
  const [isChatOpen, setIsChatOpen] = useState(false); // Added for chat
  const [isConnecting, setIsConnecting] = useState(false); // Added for button feedback
  const [infoUrl, setInfoUrl] = useState(null);
  const [hasLoadedDeals, setHasLoadedDeals] = useState(false);
  const [isLoadingInfoUrl, setIsLoadingInfoUrl] = useState(false);

  useEffect(() => {
    if (currentUser?.comId && !hasLoadedDeals) {
      // Set local loading to true immediately
      setLocalLoading(true);
      // Set flag to prevent duplicate calls
      setHasLoadedDeals(true);
      
      // Fetch data
      fetchDeals();
    }
  }, [currentUser, fetchDeals, hasLoadedDeals]);

  // Add effect to turn off local loading when deals are loaded
  useEffect(() => {
    if (deals && deals.length > 0 && localLoading) {
      setLocalLoading(false);
    }
    
    // Also turn off local loading after a delay if no deals found
    if (!contextLoading && localLoading) {
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [deals, contextLoading, localLoading]);

  const handleCalendarClick = (itineraryId) => {
    if (itineraryId) {
      setDeclineDealId(null);
      setDeleteDealId(null);
      // Close chat if it's open
      setIsChatOpen(false);
      setChatData(null);
      
      if (visibleItineraryId === itineraryId) {
        setVisibleItineraryId(null);
      } else {
        setVisibleItineraryId(itineraryId);
        if (!itineraries[itineraryId]) {
          fetchItinerary(itineraryId);
        }
      }
    }
  };

  const handleCopyClick = (itineraryText) => {
    if (itineraryText) {
      navigator.clipboard.writeText(itineraryText)
        .then(() => {
          toast.success("Itinerary text copied to clipboard", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate('/itinerary', { state: { copiedText: itineraryText } });
        })
        .catch((error) => {
          console.error("Failed to copy text: ", error);
          toast.error("Failed to copy text", {
            position: "top-right",
            autoClose: 3000,
          });
        });
    } else {
      toast.warning("No itinerary text available to copy", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  
  const handleCloseItinerary = () => {
    setVisibleItineraryId(null);
  };

  const handleDeclineClick = (dealId) => {
    setVisibleItineraryId(null);
    setDeleteDealId(null);
    setDeclineDealId(dealId);
  };

  const handleDeleteClick = (dealId) => {
    setVisibleItineraryId(null);
    setDeclineDealId(null);
    setDeleteDealId(dealId);
  };

  const handleCloseDecline = () => {
    setDeclineDealId(null);
    setApiResponse(null);
  };

  const handleCloseDelete = () => {
    setDeleteDealId(null);
    setApiResponse(null);
  };

  const handleSubmitDecline = async (data) => {
    if (!currentUser || !declineDealId) {
      return;
    }

    try {
      setDeclineInProgress(true);
      const response = await deleteConversationWithReview(declineDealId, {
        rating: data.rating,
        feedback: data.feedback,
        reason: data.reason,
        isDecline: true,
      });
      
      // Return the entire response object to the ReviewDecline component
      return response;
    } catch (error) {
      throw error;
    } finally {
      setDeclineInProgress(false);
    }
  };

  const handleSubmitDelete = async (data) => {
    if (!currentUser || !deleteDealId) {
      return;
    }

    try {
      setDeleteInProgress(true);
      const response = await deleteConversationWithReview(deleteDealId, {
        rating: data.rating,
        feedback: data.feedback,
        worked: data.worked,
        isDecline: false,
      });
      
      // Return the entire response object to the ReviewDelete component
      return response;
    } catch (error) {
      throw error;
    } finally {
      setDeleteInProgress(false);
    }
  };

  // Updated function for "Open" button with JWT token validation
  const handleOpenConnect = async (dealId) => {
    const deal = deals.find(
      (d) =>
        d.conversationId === dealId ||
        d.threadId === dealId ||
        d.itineraryId === dealId
    );
    if (!deal || !deal.threadId) return;

    try {
      setIsConnecting(true);
      
      // Check ACS Token Validity using JWT validation
      let chatData;
      const isTokenValid = deal.accessToken && AcsService.isTokenValid(deal.accessToken);
      
      if (isTokenValid) {
        // Valid token path
        chatData = {
          threadId: deal.threadId,
          acsUserId: deal.acsUserId,
          token: deal.accessToken,
          message: deal.buyerName,
          itineraryId: deal.itineraryId,
          conversationId: deal.conversationId,
          sellerCompanyId: deal.sellerCompanyId
        };
      } else {
        // Invalid token path - Call API to refresh ACS token
        const refreshedData = await AcsService.getRefreshedAcsToken();
        
        if (!refreshedData || !refreshedData.token) {
          throw new Error('Failed to refresh ACS token');
        }
        
        chatData = {
          threadId: deal.threadId,
          acsUserId: refreshedData.acsUserId,
          token: refreshedData.token,
          message: deal.buyerName,
          itineraryId: deal.itineraryId,
          conversationId: deal.conversationId
        };
      }
      
      // Set chat data and open chat
      setChatData(chatData);
      setIsChatOpen(true);
      
      // Reset other panels
      setVisibleItineraryId(null);
      setDeclineDealId(null);
      setDeleteDealId(null);
    } catch (error) {
      toast.error("Failed to open chat: " + (error.message || "Unknown error"), {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Original function for "Initiate" button (updated to set state instead of navigate)
  const handleConnect = async (dealId) => {
    const deal = deals.find(
      (d) =>
        d.conversationId === dealId || d.threadId === dealId || d.itineraryId === dealId
    );
    if (!deal) return;

    try {
      setIsConnecting(true); 
      const data = await AcsService.getChatThread({
        itineraryId: deal.itineraryId,
        companyId: currentUser?.comId, 
        needs: false,
        isBuyer: false, 
        source: 'easycharter',
        conversationId: deal.conversationId || '', 
      });
      console.log('AcsService.getChatThread returned:', data);
      if (!data.threadId) {
        throw new Error('No threadId returned from chat service');
      }
      // Set chat data and open chat instead of navigating
      data.message = deal.buyerName; // Add buyer name as message
      data.itineraryId = deal.itineraryId; // Add itineraryId to data
      data.conversationId = deal.conversationId; // Add conversationId to data
      setChatData(data);
      setIsChatOpen(true);
      // Reset other panels
      setVisibleItineraryId(null);
      setDeclineDealId(null);
      setDeleteDealId(null);
    } catch (error) {
      console.error('Error connecting to chat:', error);
      toast.error("Failed to initiate chat", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsConnecting(false); 
    }
  };

  // Handle itinerary click from chat component
  const handleItineraryClickFromChat = (itineraryId) => {
    // Only fetch the itinerary data but don't show the side panel
    if (itineraryId && !itineraries[itineraryId]) {
      fetchItinerary(itineraryId);
    }
    // We don't call handleCalendarClick here anymore since
    // the itinerary will be displayed as overlay in the chat component
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setChatData(null);
  };

  const handleInfoClick = async () => {
    // If we already have the URL or are currently loading it, don't make another request
    if (infoUrl || isLoadingInfoUrl) {
      if (infoUrl) {
        setInfoUrl(infoUrl); // Just make the modal appear
      }
      return;
    }
    
    try {
      setIsLoadingInfoUrl(true);
      const url = await getInfoContent('deals', 'info');
      setInfoUrl(url);
    } catch (error) {
      console.error('Error loading info content:', error);
      toast.info(error.message || "Failed to load information", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoadingInfoUrl(false);
    }
  };

  const handleCloseInfo = () => {
    setInfoUrl(null);
  };

  useEffect(() => {
    if (apiResponse) {
      if (apiResponse.error) {
        setDeleteDealId(null);
        setDeclineDealId(null);
      } else if (apiResponse.message) {
        setDeleteDealId(null);
        setDeclineDealId(null);
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    return () => {
      setVisibleItineraryId(null);
      setDeclineDealId(null);
      setDeleteDealId(null);
      resetItineraryState();
      setApiResponse(null);
      setIsChatOpen(false); // Cleanup chat state
      setChatData(null);
      // Reset flags for next mount
      setHasLoadedDeals(false);
      setLocalLoading(true);
    };
  }, [resetItineraryState]);

  // Always render the skeleton when loading, regardless of deals state
  if (loading) {
    return <SkeletonDealCard />;
  }

  // Only check for empty deals after confirming we're not loading
  if (!deals || deals.length === 0) {
    return <div>No deals available</div>;
  }

  const declinedDeal = declineDealId
    ? deals.find(
        (deal) =>
          deal.conversationId === declineDealId ||
          deal.threadId === declineDealId ||
          deal.itineraryId === declineDealId
      )
    : null;

  const deletedDeal = deleteDealId
    ? deals.find(
        (deal) =>
          deal.conversationId === deleteDealId ||
          deal.threadId === deleteDealId ||
          deal.itineraryId === deleteDealId
      )
    : null;

  return (
    <div className="flex flex-col md:flex-row w-full -mt-4">
      {/* Left Side: Deal List */}
      <div className="w-full md:w-1/2 p-4">
        <div className="flex items-center space-x-1 text-2xl font-bold pb-2 text-black">
          <span>Your Deals</span>
          <Info 
            size={25} 
            className="text-gray-500 cursor-pointer ml-4 hover:text-gray-700" 
            onClick={handleInfoClick}
          />
        </div>
        <div className="space-y-4">
          {deals.map((deal) => (
            <React.Fragment key={deal.conversationId || deal.threadId || deal.itineraryId}>
              {/* Ribbon Icon - Positioned outside and overlapping into card */}
              {deal.buyerTag && (
                <div className="relative z-10 h-0">
                  <div className="absolute -right-1 -top-11">
                    <img src={RibbonIcon} alt="Ribbon Icon" className="w-22 h-28" />
                  </div>
                </div>
              )}
              <div
                className={`border border-black rounded-lg relative p-4 mb-4 overflow-hidden ${
                  (visibleItineraryId === deal.itineraryId || 
                   declineDealId === (deal.conversationId || deal.threadId || deal.itineraryId) ||
                   deleteDealId === (deal.conversationId || deal.threadId || deal.itineraryId) ||
                   (isChatOpen && chatData?.threadId === deal.threadId)) 
                   ? 'ring-2 ring-black bg-blue-50 shadow-lg transform scale-[1.02] transition-all'
                  : 'bg-white'
                }`}
              >
                <div className="pb-4 pr-24">
                  <div className="text-xl font-semibold text-black truncate">{deal.buyerName}</div>
                  <div className="text-black mt-2 break-words">{deal.itineraryFromTo}</div>
                  <div className="text-black break-words">{deal.message || "No additional details available."}</div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative">
                  <div className="flex space-x-3 mb-2 sm:mb-0">
                    {deal.allowDelete !== false && (
                      <div className="p-2" onClick={() => handleDeleteClick(deal.conversationId || deal.threadId || deal.itineraryId)}>
                        <Trash2 size={20} className="text-black cursor-pointer hover:text-gray-700" />
                      </div>
                    )}
                    <div className="p-2">
                      <ShieldQuestion size={20} className="text-black" />
                    </div>
                    <div className="p-2" onClick={() => handleCalendarClick(deal.itineraryId)}>
                      <CalendarClock size={20} className="text-black cursor-pointer hover:text-gray-700" />
                    </div>
                    <div className="p-2" onClick={() => handleCopyClick(deal.itineraryText)}>
                      <Copy size={20} className="text-black cursor-pointer hover:text-gray-700" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 sm:absolute sm:right-0 sm:top-[-2rem]">
                    {/* Container to ensure consistent alignment */}
                    <div className="flex items-center space-x-5">
                      {/* For "Open" button */}
                      {deal.threadId !== null && deal.sellerInitiation === false && (
                        <div className="flex flex-col items-center">
                          <div
                            onClick={() => handleOpenConnect(deal.conversationId || deal.threadId || deal.itineraryId)}
                            className="w-12 h-12 rounded-full flex items-center justify-center mb-1 cursor-pointer bg-[#c1ff72]"
                          >
                            <MessagesSquare size={22} className="text-black" />
                          </div>
                          <div className="text-xs font-medium text-black">Open</div>
                        </div>
                      )}

                      {/* For "Initiate" button */}
                      {deal.threadId === null && deal.sellerInitiation === true && (
                        <div className="flex flex-col items-center">
                          <div
                            onClick={() => handleConnect(deal.conversationId || deal.threadId || deal.itineraryId)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 cursor-pointer transition-colors ${
                              isConnecting ? 'bg-gray-400' : 'bg-yellow-400 hover:bg-yellow-500'
                            }`}
                          >
                            {isConnecting ? (
                              <svg
                                className="animate-spin h-6 w-6 text-black"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              <MessageSquareDot size={22} className="text-black" />
                            )}
                          </div>
                          <div className="text-xs font-medium text-black">{isConnecting ? 'Connecting...' : 'Initiate'}</div>
                        </div>
                      )}

                      {/* Decline button - Space is reserved even if not rendered */}
                      <div className="flex flex-col items-center w-12 min-w-[48px]">
                        {deal.allowDecline !== false ? (
                          <>
                            <div
                              className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-1 cursor-pointer hover:bg-red-900"
                              onClick={() => handleDeclineClick(deal.conversationId || deal.threadId || deal.itineraryId)}
                            >
                              <ThumbsDown size={22} className="text-white" />
                            </div>
                            <div className="text-xs font-medium text-black">Decline</div>
                          </>
                        ) : (
                          /* Empty div to maintain spacing */
                          <div className="w-12 h-12"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right Side: Itinerary, ReviewDecline, ReviewDelete, or Chat Display */}
      <div className="w-full md:w-1/2 p-4 mt-4 md:mt-8">
        {visibleItineraryId && (
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* DealItinerary Component */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <DealItinerary
                itinerary={itineraries[visibleItineraryId] || []}
                loading={loadingItinerary}
                error={itineraryError}
                onClose={handleCloseItinerary}
              />
            </div>

            {/* RouteMap Component */}
            {itineraries[visibleItineraryId] && itineraries[visibleItineraryId].itinerary && (
                <RouteMap
                  itineraryData={{
                    flights: itineraries[visibleItineraryId].itinerary.map(leg => ({
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
        )}
  
        {declineDealId && declinedDeal && (
          <div className="lg:sticky lg:top-6">
            <ReviewDecline
              dealBuyerName={declinedDeal.buyerName}
              onClose={handleCloseDecline}
              onSubmit={handleSubmitDecline}
              isSubmitting={declineInProgress}
            />
          </div>
        )}
  
        {deleteDealId && deletedDeal && (
          <div className="lg:sticky lg:top-6">
            <ReviewDelete
              dealBuyerName={deletedDeal.buyerName}
              onClose={handleCloseDelete}
              onSubmit={handleSubmitDelete}
              isSubmitting={deleteInProgress}
            />
          </div>
        )}

        {isChatOpen && chatData && (
          <div className="lg:sticky lg:top-6 relative h-[calc(100vh-12rem)] rounded-lg overflow-hidden border border-gray-200">
            <CommonChat
              chatData={chatData} 
              onClose={handleCloseChat}
              onItineraryClick={handleItineraryClickFromChat}
              itineraryData={chatData?.itineraryId ? itineraries[chatData.itineraryId] : null}
              itineraryType="deal"
            />
          </div>
        )}
      </div>

      {/* Info Modal */}
      <InfoModal url={infoUrl} onClose={handleCloseInfo} />
    </div>
  );
};

export default DealCard;