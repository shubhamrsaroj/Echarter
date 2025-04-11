import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  PlaneLanding,
  PlaneTakeoff,
  TicketsPlane,
  Calendar,
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import PostForm from "./PostForm";
import DeleteConfirmation from "./DeleteConfirmation";
import CalendarView from "./CalendarView";
import { useSellerContext } from "../../../context/seller/SellerContext";
import SkeletonHaveCard from "./SkeletonHaveCard";
import InfoModal from "../../../components/common/InfoModal";
import { getInfoContent } from "../../../api/infoService";
import { toast } from "react-toastify";

const HaveCard = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [infoUrl, setInfoUrl] = useState(null);
  const { 
    haves, 
    fetchHaves, 
    deleteHave, 
    loading, 
    deleteSuccess,
    deleteError,
    resetSuccessMessages 
  } = useSellerContext();

  useEffect(() => {
    fetchHaves();
  }, [fetchHaves]);

  const handleInfoClick = async () => {
    try {
      const url = await getInfoContent('haves', 'info');
      setInfoUrl(url);
    } catch (error) {
      console.error('Error loading info content:', error);
      toast.info(error.message || "Failed to load information", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCloseInfo = () => {
    setInfoUrl(null);
  };

  useEffect(() => {
    let timeoutId;
    if (deleteSuccess || deleteError) {
      timeoutId = setTimeout(() => {
        resetSuccessMessages();
        if (deleteSuccess) {
          setShowDeleteConfirmation(false);
        }
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [deleteSuccess, deleteError, resetSuccessMessages]);

  const handlePlusClick = () => setShowPostForm(true);
  const handleClosePostForm = () => setShowPostForm(false);
  
  const handleCalendarClick = () => setShowCalendarView(true);
  const handleCloseCalendar = () => setShowCalendarView(false);

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
        // Error is now handled in the context and will show as a notification
      }
    }
  };

  if (showCalendarView) {
    return (
      <CalendarView 
        haves={haves} 
        onClose={handleCloseCalendar} 
        onPlusClick={handlePlusClick}
      />
    );
  }

  return (
    <div className="w-full max-w-8xl flex flex-col md:flex-row mt-6 relative">
      {/* Success notification */}
      {deleteSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <CheckCircle className="mr-2" />
          <span>{deleteSuccess}</span>
        </div>
      )}

      {/* Error notification */}
      {deleteError && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center shadow-lg">
          <AlertCircle className="mr-2" />
          <span>{deleteError}</span>
        </div>
      )}

      <div className="md:w-1/2 w-full pr-2">
        <div className="flex items-center justify-between mb-2 relative">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold">Haves</h2>
            <Info 
              size={25} 
              className="text-gray-400 cursor-pointer ml-4 hover:text-gray-600" 
              onClick={handleInfoClick}
            />
          </div>
          <div className="flex items-center space-x-4 absolute right-8">
            <button
              onClick={handleCalendarClick}
              className="bg-white text-black p-1 rounded-full h-9 w-9 flex items-center justify-center transition duration-200 border border-gray-200 shadow-sm"
              aria-label="View calendar"
            >
              <Calendar className="h-5 w-5" />
            </button>
            <button
              onClick={handlePlusClick}
              className="bg-[#c1ff72] text-black p-1 rounded-full h-9 w-9 flex items-center justify-center transition duration-200"
              aria-label="Add new post"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
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
              <div className="flex flex-col min-w-0 w-full ">
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
                    <p className="text-black font-bold mt-2"> {item?.price}</p>
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
                      <Calendar className="h-4 w-4 mr-1" />
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
          isError={!!deleteError}
        />
      )}

      {/* Info Modal */}
      <InfoModal url={infoUrl} onClose={handleCloseInfo} />
    </div>
  );
};

export default HaveCard;