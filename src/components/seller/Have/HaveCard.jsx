import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  PlaneLanding,
  PlaneTakeoff,
  TicketsPlane,
  CalendarClock,
  Info,
  CheckCircle
} from "lucide-react";
import PostForm from "./PostForm";
import DeleteConfirmation from "./DeleteConfirmation";
import { useSellerContext } from "../../../context/seller/SellerContext";
import SkeletonHaveCard from "./SkeletonHaveCard";

const HaveCard = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { 
    haves, 
    fetchHaves, 
    deleteHave, 
    loading, 
    deleteSuccess,
    resetSuccessMessages 
  } = useSellerContext();

  useEffect(() => {
    fetchHaves(903);
  }, [fetchHaves]);

  useEffect(() => {
    let timeoutId;
    if (deleteSuccess) {
      timeoutId = setTimeout(() => {
        resetSuccessMessages();
        setShowDeleteConfirmation(false);
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [deleteSuccess, resetSuccessMessages]);

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

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      try {
        await deleteHave(selectedItem.id);
      } catch (error) {
        console.error("Failed to delete have:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-8xl flex flex-col md:flex-row mt-6 relative">
      {deleteSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <CheckCircle className="mr-2" />
          <span>{deleteSuccess}</span>
        </div>
      )}

      <div className="md:w-1/2 w-full pr-2">
        <div className="flex items-center justify-between mb-2 relative">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold">Haves</h2>
            <Info className="h-5 w-5 text-gray-500" />
          </div>
          <button
            onClick={handlePlusClick}
            className="bg-[#c1ff72] text-black p-1 rounded-full h-9 w-9 flex items-center justify-center transition duration-200 absolute right-8"
            aria-label="Add new post"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <SkeletonHaveCard key={index} />
            ))}
          </div>
        ) : haves.length > 0 ? (
          haves.map((item) => (
            <div
              key={item?.id}
              className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition duration-200 mb-4 flex justify-between items-center relative overflow-hidden"
            >
              <div className="flex flex-col min-w-0 w-full">
                <div className="break-words whitespace-normal text-lg font-bold pr-6">
                  {item?.acType}
                </div>
                <div className="flex mt-2 flex-wrap justify-between items-start">
                  <div className="flex flex-col mr-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-black text-sm font-bold truncate max-w-full">{item?.acCat}</p>
                      <span className="text-black text-sm font-bold">-</span>
                      <p className="text-black text-sm font-bold truncate max-w-full">{item?.availType}</p>
                    </div>
                    <p className="text-black font-bold mt-2">USD {item?.price}</p>
                  </div>
                  <div className="text-md text-gray-800 min-w-0 flex-shrink-0">
                    <div className="flex items-center mb-1">
                      <PlaneTakeoff className="h-4 w-4 mr-1" />
                      <span className="truncate">{item?.fromCity}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <PlaneLanding className="h-4 w-4 mr-1" />
                      <span className="truncate">{item?.toCity}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <TicketsPlane className="h-4 w-4 mr-1" />
                      <span className="truncate">{item?.seats}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-1" />
                      <span className="truncate">
                        {item?.dateFrom
                          ? new Date(item.dateFrom).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}{" "}
                        -{" "}
                        {item?.dateTo
                          ? new Date(item.dateTo).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteClick(item)}
                className="bg-[#ff1616] text-white p-1 rounded-full h-9 w-9 flex items-center justify-center transition duration-200 absolute top-3 right-8"
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
        <DeleteConfirmation 
          onCancel={handleCancelDelete} 
          onConfirm={handleConfirmDelete} 
        />
      )}
    </div>
  );
};

export default HaveCard;