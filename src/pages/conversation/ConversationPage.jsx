import React from 'react';
import MessageItem from '../../components/Conversation/ConversationItem/MessageItem';
import EmailItem from '../../components/conversation/ConversationItem/EmailItem';

const ConversationPage = () => {
  return (
    <div className="p-10 w-full mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Conversations</h1>

      <div className="space-y-6">
        <MessageItem 
          title="Itinerary Text - Company Name" 
          notificationCount={2} 
        />
        
        <EmailItem 
          title="Itinerary Text - Company Name" 
          notificationCount={2} 
        />
      </div>
    </div>
  );
};

export default ConversationPage;