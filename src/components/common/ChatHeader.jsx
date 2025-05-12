import React, { useState } from 'react';
import { CalendarClock, FileText, ScrollText, UserRoundPlus, Phone, X } from 'lucide-react';
import DealItinerary from '../seller/Deal/DealItinerary';
import BuyerItinerary from '../buyer/Itinerary/BuyerItinerary';
import NeedItinerary from '../seller/Need/NeedItinerary';
import FilesBrowser from './FilesBrowser';
import AircraftDetails from './AircraftDetails';
import { toast } from 'react-toastify';
import { getTailDetailsById } from '../../api/ConversationActivity/GetTailDetailsService';

const ChatHeader = ({ 
  chatData, 
  onClose, 
  showItinerary, 
  isInCall, 
  isTransitioningCall, 
  handleCallToggle,
  handleItineraryClick,
  handleFilesClick,
  itineraryType = 'deal',
  itineraryData,
  loadingItinerary,
  disableDefaultItinerary = false,
}) => {
  const [showLocalItinerary, setShowLocalItinerary] = useState(showItinerary);
  const [showLocalFilesBrowser, setShowLocalFilesBrowser] = useState(false);
  const [showAircraftDetails, setShowAircraftDetails] = useState(false);
  const [filesList, setFilesList] = useState([]);
  const [aircraftData, setAircraftData] = useState(null);
  const [loadingAircraft, setLoadingAircraft] = useState(false);

  React.useEffect(() => {
    setShowLocalItinerary(showItinerary);
  }, [showItinerary]);

  const getItineraryLabel = () => {
    switch(itineraryType) {
      case 'buyer':
        return 'Itinerary';
      case 'need':
        return 'Itinerary';
      case 'deal':
      default:
        return 'Itinerary';
    }
  };

  const handleLocalItineraryClick = () => {
    if (handleItineraryClick) {
      handleItineraryClick();
    }
  };

  const handleLocalFilesClick = () => {
    if (!chatData?.conversationId) {
      toast.info('Please send a message first before accessing files');
      return;
    }
    
    if (handleFilesClick) {
      handleFilesClick();
    }
    
    setShowLocalFilesBrowser(!showLocalFilesBrowser);
  };

  const handleFilesChange = (updatedFiles) => {
    setFilesList(updatedFiles);
  };

  const handleAircraftClick = async () => {
    if (!chatData?.conversationId) {
      toast.info('Please send a message first before accessing equipment details');
      return;
    }

    setShowAircraftDetails(true);
    setLoadingAircraft(true);

    try {
      const response = await getTailDetailsById(chatData.conversationId, chatData.sellerCompanyId);
      setAircraftData(response.data);
    } catch (error) {
      if (error.message === 'Invalid user data') {
        toast.warning('User data could not be validated, some features may be limited', {
          autoClose: 5000
        });
      } else {
        toast.error(error.message || 'Failed to load equipment details');
        setShowAircraftDetails(false);
      }
    } finally {
      setLoadingAircraft(false);
    }
  };

  const handleCloseItinerary = () => {
    setShowLocalItinerary(false);
    if (handleItineraryClick) {
      handleItineraryClick();
    }
  };

  const handleCloseFilesBrowser = () => {
    setShowLocalFilesBrowser(false);
  };

  const handleCloseAircraftDetails = () => {
    setShowAircraftDetails(false);
    setAircraftData(null);
  };

  const handleAircraftUpdate = (updatedData) => {
    setAircraftData(updatedData);
  };

  const renderItineraryComponent = () => {
    const commonProps = {
      itinerary: itineraryData || {},
      loading: loadingItinerary && !itineraryData,
      error: itineraryData?.error,
      onClose: handleCloseItinerary
    };

    switch(itineraryType) {
      case 'buyer':
        return <BuyerItinerary {...commonProps} />;
      case 'need':
        return (
          <NeedItinerary 
            {...commonProps} 
            selectedItineraryId={chatData?.itineraryId}
          />
        );
      case 'deal':
      default:
        return <DealItinerary {...commonProps} />;
    }
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 rounded-t-xl">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {isInCall && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
            <h2 className="text-lg font-semibold text-gray-800">
              {chatData.message}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>

        <div className="px-4 py-2 flex justify-between items-center bg-white">
          <div className="flex space-x-6">
            <button 
              className={`flex flex-col items-center ${!chatData?.itineraryId ? 'text-gray-400 cursor-not-allowed' : showLocalItinerary ? 'text-blue-600 cursor-pointer' : 'text-black hover:text-gray-700 cursor-pointer'}`}
              onClick={chatData?.itineraryId ? handleLocalItineraryClick : undefined}
              disabled={!chatData?.itineraryId}
              aria-label={`Toggle ${getItineraryLabel()}`}
            >
              <CalendarClock className="w-5 h-5" />
              <span className="text-xs mt-1">{getItineraryLabel()}</span>
            </button>
            <button 
              className="flex flex-col items-center text-black hover:text-gray-700 cursor-pointer"
              onClick={handleLocalFilesClick}
              aria-label="View files"
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs mt-1">Files</span>
            </button>
            <button 
              className={`flex flex-col items-center text-black hover:text-gray-700 cursor-pointer ${showAircraftDetails ? 'text-blue-600' : ''}`}
              onClick={handleAircraftClick}
              aria-label="View equipment"
            >
              <ScrollText className="w-5 h-5" />
              <span className="text-xs mt-1">Eqpt</span>
            </button>
            <button className="flex flex-col items-center text-black">
              <UserRoundPlus className="w-5 h-5" />
              <span className="text-xs mt-1">People</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleCallToggle}
              disabled={isTransitioningCall}
              className={`p-2 rounded-full flex items-center ${isInCall ? 'bg-green-100 text-green-600' : 'text-black hover:bg-gray-100'}`}
              aria-label={isInCall ? "Switch to chat" : "Start call"}
            >
              <Phone className="w-6 h-6" />
              {isInCall && <span className="ml-1 text-xs font-medium">Switch to Chat</span>}
            </button>
          </div>
        </div>
      </div>

      {!disableDefaultItinerary && showLocalItinerary && chatData?.itineraryId && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-[90%] max-w-2xl max-h-[90vh] bg-white rounded-xl overflow-auto">
            {renderItineraryComponent()}
          </div>
        </div>
      )}
      
      {showLocalFilesBrowser && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-[100%] max-w-lg max-h-[100vh] bg-white rounded-xl overflow-auto border border-black">
            <FilesBrowser 
              onClose={handleCloseFilesBrowser} 
              chatData={chatData}
              files={filesList} 
              onFilesChange={handleFilesChange}
            />
          </div>
        </div>
      )}

      {showAircraftDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 border border-black">
            <AircraftDetails 
              aircraft={aircraftData} 
              onClose={handleCloseAircraftDetails}
              loading={loadingAircraft}
              conversationId={chatData?.conversationId}
              onUpdate={handleAircraftUpdate}
              sellerCompanyId={chatData?.sellerCompanyId}
            />
        </div>
      )}
    </>
  );
};

export default ChatHeader; 