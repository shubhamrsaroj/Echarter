import React, { useState, useEffect } from "react";
import { ShieldQuestion, Trash2, CalendarClock, Copy, MessagesSquare, ThumbsDown, Info } from "lucide-react";
import { useSellerContext } from "../../../context/seller/SellerContext";
import SkeletonDealCard from "./SkeletonDealCard"; // Import the skeleton component

const DealCard = () => {
  const { deals, fetchDeals, loading, currentUser } = useSellerContext();
  const [initiatedDeals, setInitiatedDeals] = useState({});

  useEffect(() => {
    if (currentUser?.comId) {
      fetchDeals();
    }
  }, [currentUser, fetchDeals]);

  const handleInitiateClick = (dealId) => {
    setInitiatedDeals((prev) => ({
      ...prev,
      [dealId]: true,
    }));
  };

  // Show skeleton loader when loading
  if (loading) {
    return <SkeletonDealCard />;
  }

  if (!deals || deals.length === 0) {
    return <div>No deals available</div>;
  }

  return (
    <div className="flex flex-col w-full max-w-lg mt-6">
      <div className="flex items-center space-x-1 text-2xl font-bold pb-2">
        <span>Your Deals</span>
        <Info size={25} className="text-gray-400 cursor-pointer ml-4" />
      </div>
      {deals.map((deal) => (
        <div
          key={deal.conversationId || deal.threadId || deal.itineraryId}
          className="border border-gray-200 rounded-lg relative p-4 bg-white mb-4"
        >
          <div className="absolute -right-1 -top-1">
            <div className="w-8 h-12 bg-yellow-500 rounded-sm"></div>
          </div>
          <div className="pb-4">
            <div className="text-xl font-semibold">{deal.buyerName}</div>
            <div className="text-gray-600 mt-2">{deal.itineraryFromTo}</div>
            <div className="text-gray-600">{deal.message || "No additional details available."}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <div className="p-2">
                <Trash2 size={20} className="text-gray-500" />
              </div>
              <div className="p-2">
                <ShieldQuestion size={20} className="text-gray-500" />
              </div>
              <div className="p-2">
                <CalendarClock size={20} className="text-gray-500" />
              </div>
              <div className="p-2">
                <Copy size={20} className="text-gray-500" />
              </div>
            </div>
            {/* Adjusted Right-side Buttons */}
            <div className="flex space-x-6 items-start -translate-y-8 -translate-x-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 cursor-pointer ${
                    initiatedDeals[deal.conversationId] ? "bg-green-200" : "bg-yellow-400"
                  }`}
                  onClick={() => handleInitiateClick(deal.conversationId)}
                >
                  <MessagesSquare
                    size={18}
                    className={initiatedDeals[deal.conversationId] ? "text-green-700" : "text-black"}
                  />
                </div>
                <div className="text-xs">{initiatedDeals[deal.conversationId] ? "Open" : "Initiate"}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-1">
                  <ThumbsDown size={18} className="text-white" />
                </div>
                <div className="text-xs">Decline</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DealCard;