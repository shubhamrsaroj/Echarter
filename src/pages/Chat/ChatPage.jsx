import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NeedChat from '../../components/seller/Need/NeedChat';
import { ArrowLeft, MessageSquare } from 'lucide-react';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const chatData = location.state?.chatData;

  const handleCloseChat = () => {
    navigate(-1); 
  };

  const chatOptions = {
    autoFocus: true,
    topic: chatData?.message || 'Thread ID: ' + chatData?.threadId,
    sendBox: {
      singleLineMode: false
    }
  };

  const chatTheme = {
    components: {
      sendBox: {
        input: {
          placeholder: 'Type a message...'
        },
        attachmentButton: {
          root: {
            display: 'block !important',
            visibility: 'visible !important',
            color: '#6B7280',
            marginRight: '8px',
            cursor: 'pointer'
          },
          icon: {
            display: 'block !important',
            visibility: 'visible !important'
          }
        }
      },
      sendButton: {
        root: {
          backgroundColor: '#2563eb',
          color: '#ffffff'
        }
      },
      messageThread: {
        container: {
          backgroundColor: '#ffffff'
        }
      }
    }
  };

  if (!chatData) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-8 max-w-md text-center">
          <div className="mb-4">
            <MessageSquare className="w-12 h-12 text-yellow-500 mx-auto" />
          </div>
          <h2 className="font-bold text-2xl text-gray-800 mb-3">Communication Unavailable</h2>
          <p className="text-gray-600 mb-6">No communication data is available. Please try connecting again through the main interface.</p>
          <button 
            onClick={handleCloseChat}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-hidden">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCloseChat}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h1 className="font-semibold text-lg text-gray-800">
              Chat
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex overflow-y-hidden">
        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[75vh]">
            <NeedChat 
              chatData={chatData}
              options={chatOptions}
              fluentTheme={chatTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;