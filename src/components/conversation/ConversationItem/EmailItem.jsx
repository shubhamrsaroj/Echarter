import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmailItem = ({ title, notificationCount }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/email-details');
  };

  return (
    <div className="flex items-center justify-between w-full border border-gray-300 rounded-lg shadow-sm p-5 mb-4 bg-white">
      <div className="text-lg font-semibold text-gray-800">{title}</div>

      <div className="flex items-center space-x-3">
        <button
          className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 "
          onClick={handleClick}
        >
          {notificationCount} New Emails
        </button>

        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200">
          More Options
        </button>

        <button className="p-2 text-red-500 bg-red-100 rounded-full hover:bg-red-200 transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EmailItem;