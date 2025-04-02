import React, { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  Info, 
  Plus, 
  Trash2, 
  PlaneLanding, 
  PlaneTakeoff, 
  TicketsPlane, 
  Calendar,
  CheckCircle,
  X,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon
} from "lucide-react";
import { useSellerContext } from "../../../context/seller/SellerContext";
import DeleteConfirmation from "./DeleteConfirmation"; 

const CalendarView = ({ haves, onClose, onPlusClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const { 
    deleteHave, 
    deleteSuccess,
    resetSuccessMessages 
  } = useSellerContext();

  // Memoize calendar generation function
  const generateCalendarData = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    const daysInMonth = lastDay.getDate();
    const calendarArray = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
    
    // Create a mapping of date spans to items to avoid duplicates
    const dateToItemsMap = new Map();
    
    // Process each "have" item and create spans
    haves.forEach(item => {
      const fromDate = new Date(item.dateFrom);
      const toDate = new Date(item.dateTo);
      
      // Create a unique key for this item based on its properties
      const itemKey = `${item.id}-${item.availType}-${item.acType}`;
      
      // Find the span of dates within the current month
      const spanStart = new Date(Math.max(firstDay, fromDate));
      const spanEnd = new Date(Math.min(lastDay, toDate));
      
      if (spanStart <= spanEnd) {
        // This item is visible in the current month
        // Create a span object
        const span = {
          id: item.id,
          item: item,
          fromDay: spanStart.getDate(),
          toDay: spanEnd.getDate(),
          availType: item.availType,
          acType: item.acType,
          acCat: item.acCat
        };
        
        // Store this span
        if (!dateToItemsMap.has(itemKey)) {
          dateToItemsMap.set(itemKey, span);
        }
      }
    });
    
    // Now build the calendar cells
    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        calendarArray.push({ date: null, items: [], spans: [] });
      } else {
        const date = new Date(year, month, dayNumber);
        
        // Find individual items for this day (keeping this for backward compatibility)
        const availableItems = haves.filter(item => {
          const fromDate = new Date(item.dateFrom);
          const toDate = new Date(item.dateTo);
          return date >= fromDate && date <= toDate;
        });
        
        // Find spans that include this day
        const daySpans = [];
        dateToItemsMap.forEach(span => {
          if (dayNumber >= span.fromDay && dayNumber <= span.toDay) {
            // This day is part of this span
            const isStart = dayNumber === span.fromDay;
            const isEnd = dayNumber === span.toDay;
            
            daySpans.push({
              ...span,
              isStart,
              isEnd,
              isMid: !isStart && !isEnd,
            });
          }
        });
        
        calendarArray.push({ 
          date: dayNumber, 
          items: availableItems,
          spans: daySpans 
        });
      }
    }
    
    setCalendarData(calendarArray);
  }, [currentMonth, haves]);

  // Generate calendar data when month or haves change
  useEffect(() => {
    generateCalendarData();
  }, [generateCalendarData]);

  // Handle navbar visibility
  useEffect(() => {
    const navbar = document.querySelector('.seller-navbar');
    if (navbar) {
      navbar.style.display = 'none';
    }
    return () => {
      if (navbar) {
        navbar.style.display = '';
      }
    };
  }, []);

  // Handle success message timeout
  useEffect(() => {
    let timeoutId;
    if (deleteSuccess) {
      timeoutId = setTimeout(() => {
        resetSuccessMessages();
        setShowDeleteConfirmation(false);
        setSelectedItem(null);
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [deleteSuccess, resetSuccessMessages]);

  const getPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseItemView = () => {
    setSelectedItem(null);
    setShowDeleteConfirmation(false);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
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

  // Format helpers
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  };

  const getItemBackgroundColor = (availType) => {
    switch (availType) {
      case 'One Way': return 'bg-yellow-200';
      case 'Empty': return 'bg-red-200';
      case 'Transient': return 'bg-green-100';
      default: return 'bg-blue-200';
    }
  };

  const monthYearDisplay = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayHeaders = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const renderCellItems = (cell) => {
    // Group spans by availType and acType to deduplicate
    const uniqueSpans = {};
    
    cell.spans.forEach(span => {
      const key = `${span.availType}-${span.acType}-${span.id}`;
      
      if (!uniqueSpans[key]) {
        uniqueSpans[key] = span;
      }
    });
    
    return Object.values(uniqueSpans).map((span, idx) => {
      const continuesToNext = span.toDay > cell.date;
      const continuesFromPrevious = span.fromDay < cell.date;
      
      return (
        <div 
          key={`${span.availType}-${span.id}-${idx}`}
          className={`text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 ${getItemBackgroundColor(span.availType)} flex items-center justify-between`}
          onClick={() => handleItemClick(span.item)}
        >
          <div className="flex items-center overflow-hidden">
            {continuesFromPrevious && <ArrowLeftIcon className="h-3 w-3 mr-1 flex-shrink-0" />}
            <span className="truncate">{span.availType}</span>
          </div>
          {continuesToNext && <ArrowRight className="h-3 w-3 ml-1 flex-shrink-0" />}
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-6xl inset-0 z-40 overflow-y-auto">
      {/* Success notification */}
      {deleteSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <CheckCircle className="mr-2" />
          <span>{deleteSuccess}</span>
        </div>
      )}

      {/* Delete confirmation modal - Increased z-index to ensure visibility */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <DeleteConfirmation 
            onCancel={handleCancelDelete} 
            onConfirm={handleConfirmDelete} 
          />
        </div>
      )}

      {/* Selected item modal */}
      {selectedItem && !showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fae3e3] rounded-lg border border-black b-4 w-full max-w-2xl p-6 relative">
            <button
              onClick={handleCloseItemView}
              className="absolute top-1 right-1 text-gray-500 hover:text-gray-800 z-10" 
            >
              <X className="h-6 w-6" /> 
            </button>
            
            <div className="p-3 rounded-md mb-4 flex justify-between items-center relative overflow-hidden bg-[#fae3e3]">
              <div className="flex flex-col min-w-0 w-full">
                <div className="break-words whitespace-normal text-lg font-bold pr-6">
                  {selectedItem.acType}
                </div>
                <div className="flex mt-2 flex-wrap justify-between items-start">
                  <div className="flex flex-col mr-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-black text-sm font-bold truncate max-w-full">{selectedItem.acCat}</p>
                      <span className="text-black text-sm font-bold">-</span>
                      <p className="text-black text-sm font-bold truncate max-w-full">{selectedItem.availType}</p>
                    </div>
                    <p className="text-black font-bold mt-2">{selectedItem.price}</p>
                  </div>
                  <div className="text-md text-gray-800 min-w-0 flex-shrink-0">
                    <div className="flex items-center mb-1">
                      <PlaneTakeoff className="h-4 w-4 mr-1" />
                      <span className="truncate">{selectedItem.fromCity}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <PlaneLanding className="h-4 w-4 mr-1" />
                      <span className="truncate">{selectedItem.toCity}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <TicketsPlane className="h-4 w-4 mr-1" />
                      <span className="truncate">{selectedItem.seats}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="truncate">
                        {formatDate(selectedItem.dateFrom)} - {formatDate(selectedItem.dateTo)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteClick(selectedItem)}
                className="bg-[#ff1616] text-white p-1 rounded-full h-9 w-9 flex items-center justify-center transition duration-200 absolute top-3 right-8 z-10"
                aria-label="Delete item"
              >
                <Trash2 className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main calendar view */}
      <div className="max-w-6xl mx-auto">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center mb-6">
            <button onClick={onClose} className="mr-4" aria-label="Go back">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">Haves</h2>
                <Info className="h-5 w-5 text-gray-500" />
              </div>
              <button
                onClick={onPlusClick}
                className="bg-[#c1ff72] text-black p-1 rounded-full h-9 w-9 flex items-center justify-center transition duration-200"
                aria-label="Add new post"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <button onClick={getPreviousMonth} className="px-4 py-2 border rounded hover:bg-gray-100">
              Previous
            </button>
            <h2 className="text-2xl font-bold">{monthYearDisplay}</h2>
            <button onClick={getNextMonth} className="px-4 py-2 border rounded hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="border rounded overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-100">
            {dayHeaders.map((day, index) => (
              <div key={index} className="p-2 text-center border-b font-medium">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {calendarData.map((cell, index) => (
              <div 
                key={index} 
                className={`min-h-24 p-1 border-b border-r relative ${
                  cell.date === null ? 'bg-gray-50' : ''
                } ${ (index + 1) % 7 === 0 ? 'border-r-0' : ''}`}
              >
                {cell.date !== null && (
                  <>
                    <div className={`text-right p-1 ${
                      [5, 6, 12, 13, 19, 20, 26, 27].includes(index) ? 'text-red-500' : ''
                    }`}>
                      {cell.date}
                    </div>
                    <div className="overflow-y-auto max-h-20">
                      {renderCellItems(cell)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;