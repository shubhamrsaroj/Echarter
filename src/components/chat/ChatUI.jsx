import React, { useEffect, useState } from 'react';
import { 
  ChatComposite, 
  createAzureCommunicationChatAdapter,
  CallComposite,
  createAzureCommunicationCallAdapter
} from '@azure/communication-react';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { Calendar, FileText, Paperclip, UserRoundPlus, Phone, X, Minimize2, Maximize2 } from 'lucide-react';

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

const ChatUI = ({ chatData, onClose, onMinimizeChange }) => {
  const [chatAdapter, setChatAdapter] = useState(null);
  const [callAdapter, setCallAdapter] = useState(null);
  const [error, setError] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isTransitioningCall, setIsTransitioningCall] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Add effect to notify parent of minimize state changes
  useEffect(() => {
    if (onMinimizeChange) {
      onMinimizeChange(isMinimized);
    }

    // Handle body scrolling
    if (!isMinimized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMinimized, onMinimizeChange]);

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

  const handleMouseDown = (e) => {
    if (isMinimized && e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - 300;  // 300px is minimized width
      const maxY = window.innerHeight - 60;  // 60px is minimized height
      
      setPosition({
        x: Math.min(Math.max(0, newX), maxX),
        y: Math.min(Math.max(0, newY), maxY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, handleMouseMove, handleMouseUp]);

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

  const containerStyle = isMinimized ? {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: '300px',
    height: '60px',
    zIndex: 1000,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: isDragging ? 'none' : 'all 0.3s ease',
    cursor: isDragging ? 'grabbing' : 'grab',
    background: '#fff',
    borderRadius: '8px',
    pointerEvents: 'auto',
    overflow: 'hidden'
  } : {
    position: 'relative',
    height: '100%',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  return (
    <div className="h-full">
      <div 
        className="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden border border-black"
        style={containerStyle}
      >
        {/* Header */}
        <div 
          className="flex flex-col bg-white border-b border-gray-200 relative"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Title and Controls Bar */}
          <div 
            className="flex items-center justify-between px-4 py-3"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {isMinimized && isInCall && (
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
              )}
              <h2 className="text-lg font-semibold text-gray-800 truncate">
                Chat
              </h2>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-5 h-5 text-gray-700" />
                ) : (
                  <Minimize2 className="w-5 h-5 text-gray-700" />
                )}
              </button>
              {!isMinimized && onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isMinimized && (
            <div className="px-4 py-2 flex justify-between items-center bg-white border-t border-gray-100">
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
              
              <div className="flex items-center">
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
          )}
        </div>
        
        {/* Chat Area */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden bg-white pb-4">
            <div className={`h-full ${isInCall ? 'hidden' : ''}`}>
              <ChatComposite
                adapter={chatAdapter}
                options={{
                  styles: {
                    sendBox: {
                      root: {
                        marginBottom: '16px'
                      }
                    }
                  }
                }}
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
        )}
      </div>
    </div>
  );
};

export default ChatUI;

