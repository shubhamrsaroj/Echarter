import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  PlaneLanding,
  PlaneTakeoff,
  TicketsPlane,
  CalendarClock,
  Info,
} from "lucide-react";
import PostForm from "./PostForm";
import DeleteConfirmation from "./DeleteConfirmation";
import { useSellerContext } from "../../context/seller/SellerContext";
import SkeletonHaveCard from "./SkeletonHaveCard"; 

const HaveCard = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { haves, fetchHaves, deleteHave, loading } = useSellerContext();

  useEffect(() => {
    fetchHaves(903);
  }, []);

  const handlePlusClick = () => setShowPostForm(true);
  const handleClosePostForm = () => setShowPostForm(false);

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSelectedItem(null);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      deleteHave(selectedItem.id);
    }
    setShowDeleteConfirmation(false);
    setSelectedItem(null);
  };

  return (
    <div className="w-full max-w-8xl flex flex-col md:flex-row mt-6 px-4 md:px-0">
      <div className="md:w-1/2 w-full pr-2">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-2 relative">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold">Haves</h2>
            <Info className="h-5 w-5 text-gray-500" />
          </div>
          <button
            onClick={handlePlusClick}
            className="bg-[#c1ff72] text-black p-2 rounded-full h-10 w-10 flex items-center justify-center transition duration-200 md:absolute md:right-8"
            aria-label="Add new post"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <SkeletonHaveCard key={index} />
            ))}
          </div>
        ) : haves.length > 0 ? (
          haves.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition duration-200 mb-4 flex flex-col sm:flex-row justify-between items-center relative"
            >
              <div className="flex flex-col w-full sm:w-auto">
                <h3 className="text-lg font-bold">{item.acType}</h3>
                <div className="flex flex-wrap mt-2 space-x-2 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-black text-sm font-bold">{item.acCat}</p>
                    <span className="text-black text-sm font-bold">-</span>
                    <p className="text-black text-sm font-bold">{item.availType}</p>
                  </div>
                  <p className="text-black font-bold mt-2 sm:mt-0">USD {item.price}</p>
                </div>
                <div className="text-md text-gray-800 mt-2">
                  <div className="flex items-center mb-1">
                    <PlaneTakeoff className="h-4 w-4 mr-1" />
                    <span>{item.fromCity}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <PlaneLanding className="h-4 w-4 mr-1" />
                    <span>{item.toCity}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <TicketsPlane className="h-4 w-4 mr-1" />
                    <span>{item.seats}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(item.dateFrom).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(item.dateTo).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteClick(item)}
                className="bg-[#ff1616] text-white p-2 rounded-full h-10 w-10 flex items-center justify-center transition duration-200 absolute top-3 right-3 sm:right-8"
                aria-label="Delete item"
              >
                <Trash2 className="h-6 w-6" />
              </button>
            </div>
          ))
        ) : (
          <div className="space-y-4">
            {[...Array(2)].map((_, index) => (
              <SkeletonHaveCard key={index} />
            ))}
          </div>
        )}
      </div>

      {showPostForm && (
        <div className="md:w-1/2 w-full pl-2">
          <PostForm onClose={handleClosePostForm} />
        </div>
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmation onCancel={handleCancelDelete} onConfirm={handleConfirmDelete} />
      )}
    </div>
  );
};

export default HaveCard;
