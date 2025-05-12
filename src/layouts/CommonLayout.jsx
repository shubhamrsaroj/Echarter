import React from 'react';
import Sidebar from '../components/sidebar/Sidebar';

const CommonLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default CommonLayout;