import React, { useEffect, useState } from 'react';
import { 
  ChatComposite, 
  createAzureCommunicationChatAdapter,
  CallComposite,
  createAzureCommunicationCallAdapter
} from '@azure/communication-react';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { Calendar, FileText, Paperclip, UserRoundPlus, Phone, X } from 'lucide-react';


// Add the utility functions for creating call adapter locators
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

// Global registry for call sessions
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

const CommonChat = ({ chatData, onClose }) => {
  const [chatAdapter, setChatAdapter] = useState(null);
  const [callAdapter, setCallAdapter] = useState(null);
  const [error, setError] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isTransitioningCall, setIsTransitioningCall] = useState(false);

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
  }, [chatData]);

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
    <div className="h-full">
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-black">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 rounded-t-xl">
          {/* Info */}
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

          {/* Action Buttons */}
          <div className="px-4 py-2 flex justify-between items-center bg-white">
            <div className="flex space-x-6">
              <button className="flex flex-col items-center text-gray-600">
                <Calendar className="w-5 h-5" />
                <span className="text-xs mt-1">Itinerary</span>
              </button>
              <button className="flex flex-col items-center text-gray-600">
                <FileText className="w-5 h-5" />
                <span className="text-xs mt-1">Files</span>
              </button>
              <button className="flex flex-col items-center text-gray-600">
                <Paperclip className="w-5 h-5" />
                <span className="text-xs mt-1">Attach</span>
              </button>
              <button className="flex flex-col items-center text-gray-600">
                <UserRoundPlus className="w-5 h-5" />
                <span className="text-xs mt-1">People</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCallToggle}
                disabled={isTransitioningCall}
                className={`p-2 rounded-full flex items-center ${isInCall ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Phone className="w-6 h-6" />
                {isInCall && <span className="ml-1 text-xs font-medium">Switch to Chat</span>}
              </button>
            </div>
          </div>
        </div>
        
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

