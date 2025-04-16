import React, { useState } from "react";
import { PlaneTakeoff, PlaneLanding, ArrowRight, X } from "lucide-react";
import { useSellerContext } from "../../../context/seller/SellerContext";
import { AcsService } from "../../../api/Acs/AcsService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NeedItinerary = ({ itinerary, loading, error, onClose, selectedItineraryId }) => {
  const { currentUser } = useSellerContext();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!currentUser?.comId || !selectedItineraryId) {
      console.error('Missing required data:', { 
        comId: currentUser?.comId, 
        itineraryId: selectedItineraryId 
      });
      toast.error("Missing required data for chat initiation", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsConnecting(true);
      console.log('Initiating chat with:', {
        itineraryId: selectedItineraryId,
        companyId: currentUser.comId
      });
      
      const data = await AcsService.getChatThread({
        itineraryId: selectedItineraryId,
        companyId: currentUser.comId,
        needs: null,
        isBuyer: false,
        source: 'easycharter',
        conversationId: null,
      });

      if (!data.threadId) {
        throw new Error('No threadId returned from chat service');
      }

      navigate('/chat', { state: { chatData: data } });
    } catch (error) {
      console.error('Error connecting to chat:', error);
      toast.error(error.message || "Failed to initiate chat", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f6f6f6] rounded-xl border border-black p-4 md:p-6 w-full relative animate-pulse">
        <div className="relative">
          <button
            className="absolute top-0 right-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#f6f6f6] rounded-full hover:bg-gray-300 border border-black"
            onClick={onClose}
          >
            <X className="w-5 h-5 md:w-6 md:h-6 cursor-pointer text-black" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-black text-center pr-10">Itinerary</h2>
        </div>
        
        <div className="mb-4 space-y-2">
          <div>
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
          </div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
        </div>
        
        <div>
          <div className="mb-3 md:mb-4 p-3 md:p-4 border border-black rounded-lg shadow-sm">
            <div className="h-5 w-32 bg-gray-300 rounded mb-2 mx-auto"></div>
            
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-center w-1/4">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-300 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-300 rounded mt-1"></div>
              </div>
              
              <div className="flex-1 flex flex-col items-center px-1 w-2/4">
                <div className="flex items-center w-full justify-center">
                  <div className="border-t-2 border-gray-300 flex-1"></div>
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-300 rounded-full mx-1 md:mx-2 flex-shrink-0"></div>
                  <div className="border-t-2 border-gray-300 flex-1"></div>
                </div>
                <div className="h-3 w-24 bg-gray-300 rounded mt-1"></div>
              </div>
              
              <div className="flex flex-col items-center w-1/4">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-300 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-300 rounded mt-1"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-black p-6 relative">
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 border border-black"
          onClick={onClose}
        >
          <X className="w-6 h-6 cursor-pointer text-black" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-black text-center">Itinerary</h2>
        <div className="text-center text-black">Error: {error}</div>
      </div>
    );
  }

  if (!itinerary || !itinerary.itinerary) {
    return (
      <div className="bg-white rounded-xl border border-black p-6 relative">
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 border border-black"
          onClick={onClose}
        >
          <X className="w-6 h-6 cursor-pointer text-black" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-black text-center">Itinerary</h2>
        <div className="text-center text-black">No itinerary data available</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[#f6f6f6] rounded-xl border border-black p-4 md:p-6 w-full">
      <div className="relative">
        <button
          className="absolute top-0 right-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#f6f6f6] rounded-full hover:bg-gray-300 border border-black"
          onClick={onClose}
        >
          <X className="w-5 h-5 md:w-6 md:h-6 cursor-pointer text-black" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-black text-center pr-10">Itinerary</h2>
      </div>

      <div className="mb-4 space-y-2">
        <div>
          <p className="text-sm font-bold text-black">{itinerary.tripCategory }</p>
        </div>
        <p className="text-sm text-black">{itinerary.itineraryText}</p>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {Array.isArray(itinerary.itinerary) && itinerary.itinerary.map((leg, index) => (
          <div key={index} className="mb-3 md:mb-4 p-3 md:p-4 border border-black rounded-lg shadow-sm">
            <div className="text-center text-black font-medium mb-2 text-base md:text-lg truncate">
              {formatDate(leg.date)}
            </div>
            
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-center w-1/4">
                <PlaneTakeoff className="text-black w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-black mt-1 text-sm md:text-base text-center truncate">
                  {leg.departurePlace || "N/A"}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col items-center px-1 w-2/4">
                <div className="flex items-center w-full justify-center">
                  <div className="border-t-2 border-black flex-1"></div>
                  <ArrowRight className="text-black w-6 h-6 mx-1 md:w-8 md:h-8 md:mx-2 flex-shrink-0" />
                  <div className="border-t-2 border-black flex-1"></div>
                </div>
                <div className="text-xs md:text-sm text-black mt-1 text-center">
                  {`${leg.flightCategory ? leg.flightCategory.charAt(0).toUpperCase() + leg.flightCategory.slice(1).toLowerCase() : "N/A"} ${leg.pax || "0"}`}
                </div>
              </div>
              
              <div className="flex flex-col items-center w-1/4">
                <PlaneLanding className="text-black w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-black mt-1 text-sm md:text-base text-center truncate">
                  {leg.arrivalPlace || "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 border border-black disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    </div>
  );
};

export default NeedItinerary;