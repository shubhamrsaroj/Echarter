import React, { useEffect, useState } from "react";
import { MessageSquareDot, Info } from "lucide-react";
import RibbonIcon from "../../../assets/icons.png";
import { useSellerContext } from "../../../context/seller/SellerContext"; 
import SkeletonNeedCard from "./SkeletonNeedCard";
import NeedItinerary from "./NeedItinerary"; 
import InfoModal from "../../common/InfoModal";
import { getInfoContent } from "../../../api/infoService";
import { toast } from "react-toastify";

const NeedCard = () => {
  const { 
    currentUser, 
    fetchItinerary, 
    itineraries, 
    loadingItinerary, 
    itineraryError,
  } = useSellerContext();

  const [selectedItineraryId, setSelectedItineraryId] = useState(null);
  const [infoUrl, setInfoUrl] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Fetch itineraries for company when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser?.comId) {
      fetchItinerary(currentUser.comId, 30);
    }
  }, [currentUser, fetchItinerary]);

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
  const apiNeeds = companyKey && itineraries[companyKey] ? itineraries[companyKey] : [];
  
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

  // Handle Initiate button click
  const handleInitiateClick = (itineraryId) => {
    setSelectedItineraryId(itineraryId);
    fetchItinerary(itineraryId);
  };

  // Close itinerary handler
  const handleCloseItinerary = () => {
    setSelectedItineraryId(null);
  };

  return (
    <>
      {loadingItinerary && !selectedItineraryId ? (
        <SkeletonNeedCard />
      ) : (
        <div className="flex flex-col md:flex-row w-full -mt-4">
          {/* Left Side: Need List */}
          <div className="w-full md:w-1/2 p-4">
            <div className="flex items-center space-x-1 text-2xl font-bold pb-2 text-black">
              <span>Needs</span>
              <Info 
                size={25} 
                className={`text-black cursor-pointer ml-4 ${loadingInfo ? 'animate-pulse' : ''}`}
                onClick={handleInfoClick}
              />
            </div>
            {itineraryError && !selectedItineraryId ? (
              <div>Error: {itineraryError}</div>
            ) : displayNeeds.length === 0 ? (
              <div>No needs available.</div>
            ) : (
              displayNeeds.map((need) => (
                <div
                  key={need.id}
                  className="border border-black rounded-lg relative p-4 bg-white mb-4 overflow-hidden"
                >
                  {/* Ribbon Icon */}
                  {need.buyerTag && (
                    <div className="absolute -right-6 -top-10">
                      <img src={RibbonIcon} alt="Ribbon Icon" className="w-22 h-28" />
                    </div>
                  )}

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
                    
                    {/* Initiate Button - moved to the right side but with margin to avoid overlap */}
                    <div className="flex flex-col items-center mr-12">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
                        onClick={() => handleInitiateClick(need.id)}
                      >
                        <MessageSquareDot size={24} className="text-black" />
                      </div>
                      <span className="text-xs text-black mt-1">Initiate</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Side: Itinerary Display */}
          <div className="w-full md:w-1/2 p-4 mt-2 md:mt-8">
            {selectedItineraryId && (
              <NeedItinerary
                itinerary={itineraries[selectedItineraryId] || []}
                loading={loadingItinerary}
                error={itineraryError}
                onClose={handleCloseItinerary}
              />
            )}
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoUrl && (
        <InfoModal
          url={infoUrl}
          onClose={() => setInfoUrl(null)}
        />
      )}
    </>
  );
};

export default NeedCard;