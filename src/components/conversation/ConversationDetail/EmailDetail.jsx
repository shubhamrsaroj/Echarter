import React from 'react';

const EmailDetail = ({ subject, from, to, date, isPinned = false }) => {
  return (
    <div className="flex items-center w-full border-b border-gray-200 py-3 hover:bg-gray-50">
      <div className="grid grid-cols-12 w-full">
        <div className="col-span-4 truncate pl-2">{subject}</div>
        <div className="col-span-2 truncate">{from}</div>
        <div className="col-span-2 truncate">{to}</div>
        <div className="col-span-2 truncate">{date}</div>
        {isPinned && (
          <div className="col-span-1 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailDetail;