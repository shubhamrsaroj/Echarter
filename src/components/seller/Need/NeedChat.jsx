import React from 'react';
import CommonChat from '../../common/CommonChat';

const NeedChat = ({ chatData, onClose }) => {
  return (
    <div className="h-[calc(90vh-8rem)]">
      <CommonChat 
        chatData={chatData}
        onClose={onClose}
      />
    </div>
  );
};

export default NeedChat;

