import React, { useEffect, useState } from 'react';
import { 
  ChatComposite, 
  createAzureCommunicationChatAdapter,
  CallComposite,
  createAzureCommunicationCallAdapter
} from '@azure/communication-react';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import ChatHeader from './ChatHeader';

// Utility functions for call adapter locators (unchanged)
const validateUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const isTeamsMeetingLink = (link) => {
  return typeof link === 'string' && 
    (link.startsWith('https://teams.microsoft.com/l/meetup-join/') || 
     link.startsWith('https://teams.live.com/meet/'));
};

const isGroupID = (id) => {
  if (validateUUID(id)) return true;
  return /^19:acsV1_[a-zA-Z0-9_-]+@thread\.v2$/.test(id);
};

const createCallAdapterLocator = (locator) => {
  if (isTeamsMeetingLink(locator)) {
    return { meetingLink: locator };
  } else if (isGroupID(locator)) {
    return { groupId: locator };
  } else if (/^\d+$/.test(locator)) {
    return { roomId: locator };
  }
  return undefined;
};

// Global registry for call sessions (unchanged)
const callSessionRegistry = {
  activeUsersInCall: new Set(),
  isUserInCall(userId) {
    return this.activeUsersInCall.has(userId);
  },
  registerUser(userId) {
    this.activeUsersInCall.add(userId);
  },
  unregisterUser(userId) {
    this.activeUsersInCall.delete(userId);
  },
  clearAll() {
    this.activeUsersInCall.clear();
  }
};

const CommonChat = ({ 
  chatData, 
  onClose, 
  onItineraryClick, 
  itineraryData, 
  disableDefaultItinerary = false, 
  itineraryType = 'deal' // New prop: 'deal', 'buyer', or 'need'
}) => {
  const [chatAdapter, setChatAdapter] = useState(null);
  const [callAdapter, setCallAdapter] = useState(null);
  const [error, setError] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isTransitioningCall, setIsTransitioningCall] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [loadingItinerary, setLoadingItinerary] = useState(false);

  useEffect(() => {
    if (!chatData?.threadId || !chatData?.token || !chatData?.acsUserId) {
      setError('Invalid chat data: missing threadId, token, or acsUserId');
      return;
    }

    const endpoint = import.meta.env.VITE_APP_ACS_ENDPOINT;

    const createAdapters = async () => {
      try {
        const credential = new AzureCommunicationTokenCredential(chatData.token);
        const userId = { communicationUserId: chatData.acsUserId };
        
        // Create chat adapter
        const chatAdapterInstance = await createAzureCommunicationChatAdapter({
          endpoint,
          userId,
          credential,
          threadId: chatData.threadId,
          displayName: chatData.displayName
        });
        
        setChatAdapter(chatAdapterInstance);

      } catch (err) {
        console.error('Error creating chat adapter:', err);
        setError('Failed to initialize chat: ' + err.message);
      }
    };

    createAdapters();

    return () => {
      if (chatAdapter) {
        chatAdapter.dispose();
      }
      if (callAdapter) {
        callAdapter.dispose();
        callSessionRegistry.unregisterUser(chatData.acsUserId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatData]);

  // Keep one logging statement for debugging
  useEffect(() => {
  }, [chatData, itineraryType]);

  const handleCallToggle = async () => {
    if (isTransitioningCall) return;

    setIsTransitioningCall(true);

    if (isInCall) {
      // End call
      if (callAdapter) {
        callAdapter.dispose();
        callSessionRegistry.unregisterUser(chatData.acsUserId);
        setCallAdapter(null);
      }
      setIsInCall(false);
    } else {
      // Start call
      try {
        if (callSessionRegistry.isUserInCall(chatData.acsUserId)) {
          throw new Error('User is already in an active call');
        }

        const credential = new AzureCommunicationTokenCredential(chatData.token);
        const userId = { communicationUserId: chatData.acsUserId };
        const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2);
        const displayName = (chatData.displayName || 'User') + '-' + uniqueSuffix;
        
        const locator = createCallAdapterLocator(chatData.threadId);
        if (!locator) {
          throw new Error('Invalid call locator');
        }

        callSessionRegistry.registerUser(chatData.acsUserId);
        
        const newCallAdapter = await createAzureCommunicationCallAdapter({
          userId,
          displayName,
          credential,
          locator,
          options: {
            callingSounds: false,
            callControls: {
              cameraOn: false,
              microphoneOn: true
            }
          }
        });

        setCallAdapter(newCallAdapter);
        setIsInCall(true);
      } catch (err) {
        setError('Failed to start call: ' + err.message);
        callSessionRegistry.unregisterUser(chatData.acsUserId);
      }
    }

    setIsTransitioningCall(false);
  };

  const handleItineraryClick = () => {
    // If itineraryId is missing, show warning and return
    if (!chatData?.itineraryId) {
      console.warn('CommonChat - No itineraryId found in chatData. Calendar icon should be disabled.');
      return;
    }
    
    // Modified behavior: If disableDefaultItinerary is true, use external handling ONLY
    if (disableDefaultItinerary && onItineraryClick && chatData?.itineraryId) {
      // Just trigger the callback without changing internal state
      onItineraryClick(chatData.itineraryId);
      return;
    }

    // Normal behavior: Toggle internal itinerary overlay
    setShowItinerary(!showItinerary);
    
    // If we have an itinerary callback and we're showing the itinerary (not closing it)
    // and we're NOT using disableDefaultItinerary
    if (onItineraryClick && chatData?.itineraryId && !showItinerary && !disableDefaultItinerary) {
      // Indicate loading state
      setLoadingItinerary(true);
      // Call parent handler to fetch itinerary data if needed
      // but DON'T show the full map view because we're handling it internally
      onItineraryClick(chatData.itineraryId, true); // Added second parameter to indicate internal handling
    }
  };

  const handleFilesClick = () => {
    // Now handled in ChatHeader
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!chatAdapter) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          <div>Initializing chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-black">
        {/* Using the ChatHeader component with overlay props */}
        <ChatHeader 
          chatData={chatData}
          onClose={onClose}
          showItinerary={showItinerary}
          isInCall={isInCall}
          isTransitioningCall={isTransitioningCall}
          handleCallToggle={handleCallToggle}
          handleItineraryClick={handleItineraryClick}
          handleFilesClick={handleFilesClick}
          itineraryType={itineraryType}
          itineraryData={itineraryData}
          loadingItinerary={loadingItinerary}
          disableDefaultItinerary={disableDefaultItinerary}
        />
        
        {/* Chat Area */}
        <div className="flex-1 relative overflow-hidden bg-white rounded-b-xl pb-4">
          <div className={`h-full ${isInCall ? 'hidden' : ''}`}>
            <ChatComposite
              adapter={chatAdapter}
            />
          </div>
          {isInCall && callAdapter && (
            <div className="absolute inset-0">
              <CallComposite
                adapter={callAdapter}
                options={{
                  autoFocus: true,
                }}
                fluentTheme={{
                  components: {
                    callControls: {
                      root: {
                        backgroundColor: '#ffffff'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonChat;