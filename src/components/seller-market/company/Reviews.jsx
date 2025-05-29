import React, { useContext, useEffect } from "react";
import {
  Info,
  Pencil,
  Phone,
  Plus,
  Ticket,
  FileDown,
  Trash2,
  Star,
} from "lucide-react";
import { SellerMarketContext } from "../../../context/seller-market/SellerMarketContext";

const Review = () => {
  const { companyId, selectedReviews, companyData, getReviews } = useContext(SellerMarketContext);

  useEffect(() => {
    if (companyId) {
      getReviews(companyId);
    }
  }, [companyId, getReviews]);

  console.log(selectedReviews);
  

  const renderStars = (rating) => {
    const filledStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 6; i++) {
      stars.push(
        <Star
          key={i}
          fill={i < filledStars ? "#ffce00" : "none"}
          stroke="#ffce00"
        />
      );
    }
    return stars;
  };

  return (
    <div>
      {/* Header section */}
      <div className="flex space-x-5 mb-4">
        <div className="flex space-x-16 items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Selected Reviews
          </h2>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-lime-500 transition-colors"
            style={{ backgroundColor: "#c1ff72" }}
          >
            <Pencil className="w-5 h-5 text-black" />
          </div>
          <Info className="w-10 h-10" />
        </div>
      </div>

      {/* Main content section */}
      <div className="flex items-start space-x-10">
        {/* LEFT SIDE: Selected Reviews */}
        <div className="flex flex-col space-y-8 w-4/5">
          {selectedReviews && selectedReviews.length > 0 ? (
            selectedReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm border p-6 flex space-x-6 justify-between"
              >
                <div className="flex flex-col space-y-2">
                  <span className="font-semibold text-gray-900">
                    {review.reviewBy?.name || "Anonymous"}
                  </span>
                  <span>{review.reviewBy?.role || "No Role"}</span>
                  <span>{review.feedback || "No feedback provided"}</span>
                </div>

                <div className="flex">{renderStars(review.rating)}</div>

                <div className="mt-auto pt-4">
                  <Ticket />
                </div>
              </div>
            ))
          ) : (
            <p>No selected reviews to show</p>
          )}

        </div>

        {/* RIGHT SIDE: Trust Score */}
        <div className="w-2/5 bg-gray-100 rounded-lg shadow-sm border p-2">
          <div className="flex space-x-4">
            <div className="w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Trust Score
              </h2>

              <div className="p-1 text-left">
                {/* Rank Progress Bar */}
                <div className="flex items-center justify-start mt-1">
                  <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner border border-black flex">
                    <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-black flex">
                      <div
                        className="bg-yellow-500 h-full flex items-center justify-center"
                        style={{ width: "94%" }}
                      >
                        <p className="text-xs font-semibold text-black">94.3</p>
                      </div>
                      <div
                        className="bg-black h-full"
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-blue-600 cursor-pointer">
                How to improve trust score
              </p>

              <div className="items-start mt-4">
                <div className="p-1">
                  <span>Average Rating : {companyData.averageRating}</span>
                </div>
                <div className="p-1">
                  <span>Total Reviews</span> : <span>{companyData.totalReviews}</span>
                </div>
                <div className="p-1">
                  <span>dealsDone</span> : <span>{companyData.dealsDone}</span>
                </div>
                <div className="p-1">
                  <span>dealsDeclined</span> : <span>{companyData.dealsDeclined}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
