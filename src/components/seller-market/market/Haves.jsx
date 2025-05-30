import React, { useMemo } from 'react';
import Default from './Haves/SyncfusionCalender/Default';
import PostForm from './Haves/PostForm/PostForm';
import Tasks from '../common/TaskSection/Tasks';

const Haves = () => {
  // Memoize the Default component to prevent unnecessary re-renders
  const memoizedDefault = useMemo(() => <Default />, []);

  return (
    <div className="w-full space-y-6">
      <PostForm/>
      
      <div className="flex gap-6">
        <div className="w-1/4">
          <Tasks />
        </div>
        
        <div className="w-3/4">
          {memoizedDefault}
        </div>
      </div>
    </div>
  );
};

export default Haves; 