import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Sidebar from '../components/sidebar/Sidebar';

const CommonLayout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleExpandChange = (expanded) => {
    setSidebarExpanded(expanded);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar onExpandChange={handleExpandChange} />
      <div className={`flex-1 overflow-auto ${sidebarExpanded ? 'ml-48' : 'ml-16'} transition-all duration-300 ease-in-out`}>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

CommonLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CommonLayout;