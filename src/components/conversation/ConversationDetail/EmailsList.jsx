import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailDetail from './EmailDetail';

const EmailsList = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All Emails');
  
  // Sample email data
  const emails = [
    {
      id: 1,
      subject: 'Re: Action Required : Company Information',
      from: 'support@instacharter.app',
      to: 'nathan@lixorjets.com',
      date: 'Mar 03, 2025 08:48 AM'
    },
    {
      id: 2,
      subject: 'Re: Action Required : Company Information',
      from: 'nathan@lixorjets.com',
      to: 'support@instacharter.app',
      date: 'Mar 03, 2025 08:41 AM'
    },
    {
      id: 3,
      subject: 'Re: Action Required : Company Information',
      from: 'support@instacharter.app',
      to: 'nathan@lixorjets.com',
      date: 'Feb 28, 2025 09:48 PM'
    },
    {
      id: 4,
      subject: 'Action Required : Company Information',
      from: 'support@instacharter.app',
      to: 'nathan@lixorjets.com',
      date: 'Feb 28, 2025 11:52 AM',
      isPinned: true
    },
    {
      id: 5,
      subject: 'Hello Nathan Sudiono',
      from: 'aby@instacharter.app',
      to: 'nathan@lixorjets.com',
      date: 'Feb 27, 2025 07:03 PM'
    }
  ];

  const handleBack = () => {
    navigate('/conversation');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button 
          className="bg-gray-100 px-4 py-2 rounded text-gray-700"
          onClick={handleBack}
        >
          &larr; Back
        </button>
        <div className="flex items-center">
          <div className="relative">
            <select 
              className="bg-white border border-gray-300 rounded px-4 py-2 appearance-none pr-8"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option>All Emails</option>
              <option>Emails linked to this pipeline record</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border border-gray-300 rounded bg-white">
        {/* Header */}
        <div className="grid grid-cols-12 w-full bg-gray-100 py-3 font-medium">
          <div className="col-span-4 pl-2">Subject</div>
          <div className="col-span-2">From</div>
          <div className="col-span-2">To</div>
          <div className="col-span-2">Date</div>
        </div>
        
        {/* Email list */}
        <div className="divide-y divide-gray-200">
          {emails.map(email => (
            <EmailDetail 
              key={email.id}
              subject={email.subject}
              from={email.from}
              to={email.to}
              date={email.date}
              isPinned={email.isPinned}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailsList;