import React, { useState, useEffect } from "react";
import { ShieldQuestion, Trash2, CalendarClock, Copy, MessagesSquare , ThumbsDown } from "lucide-react";
import { useSellerContext } from '../../../context/seller/SellerContext';

const DealCard = () => {
  const { deals, fetchDeals, loading, currentUser } = useSellerContext();

  // State to track initiated deals
  const [initiatedDeals, setInitiatedDeals] = useState({});

  // Fetch deals when component mounts or user changes
  useEffect(() => {
    if (currentUser?.comId) {
      fetchDeals();
    }
  }, [currentUser, fetchDeals]);

  // Handler for the Initiate/Open button click
  const handleInitiateClick = (dealId) => {
    setInitiatedDeals(prev => ({
      ...prev,
      [dealId]: true
    }));
  };

  // Optional: Handle case when no user or no deals
  
  if (loading) {
    return <div>Loading deals...</div>;
  }

  if (deals.length === 0) {
    return <div>No deals available</div>;
  }

  return (
    <div className="flex flex-col w-full max-w-lg mt-6">
      {/* Header */}
      <div className="text-2xl font-bold pb-2">Your Deals</div>

      {deals.map((deal) => (
        <div key={deal.id} className="border border-gray-200 rounded-lg relative p-4 bg-white mb-4">
          {/* Ribbon */}
          <div className="absolute -right-1 -top-1">
            <div className="w-8 h-12 bg-yellow-500 rounded-sm"></div>
          </div>

          {/* Deal Information */}
          <div className="pb-4">
            <div className="text-xl font-semibold">{deal.buyerName}</div>
            <div className="text-gray-600">{deal.itineraryText}</div>
            <div className="text-gray-600">{deal.message}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            {/* Left-side Icons */}
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

            {/* Right-side Buttons */}
            <div className="flex space-x-3 items-start">
              {/* Initiate/Open Button */}
              <div className="flex flex-col items-center -mt-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 cursor-pointer ${
                    initiatedDeals[deal.id] ? "bg-green-200" : "bg-yellow-400"
                  }`}
                  onClick={() => handleInitiateClick(deal.id)}
                >
                  <MessagesSquare 
                    size={18}
                    className={initiatedDeals[deal.id] ? "text-green-700" : "text-black"}
                  />
                </div>
                <div className="text-xs">
                  {initiatedDeals[deal.id] ? "Open" : "Initiate"}
                </div>
              </div>

              {/* Decline Button - Shifted slightly up */}
              <div className="flex flex-col items-center -mt-2">
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