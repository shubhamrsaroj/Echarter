import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import RecentSearch from './RecentSearch';
import Tasks from './TaskSection/Tasks';

const SellerSidebar = ({ activeSubTab }) => {
  // Don't show RecentSearch for these subtabs
  const hideRecentSearch = ['Directory', 'Manage Haves', 'Search'].includes(activeSubTab);
  
  // Don't show Tasks for Search tab
  const hideTasks = activeSubTab === 'Search';

  // Use useMemo to prevent Tasks from re-rendering when navigation changes
  const tasksComponent = useMemo(() => <Tasks />, []);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {!hideRecentSearch && <RecentSearch />}
        {!hideTasks && tasksComponent}
      </div>
    </div>
  );
};

SellerSidebar.propTypes = {
  activeSubTab: PropTypes.string.isRequired
};

export default SellerSidebar; 