import React from 'react';
import RecentSearch from './RecentSearch';
import Tasks from './TaskSection/Tasks';

const SellerSidebar = () => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        <RecentSearch />
        <Tasks />
      </div>
    </div>
  );
};

export default SellerSidebar; 