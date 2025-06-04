import React from 'react';
import PostForm from './Haves/PostForm/PostForm';
import Tasks from '../common/TaskSection/Tasks';

const Haves = () => {
  return (
    <div className="w-full space-y-6">
      <PostForm/>
             
      <div className="flex gap-6">
        <div className="w-1/4">
          <Tasks />
        </div>
      </div>
    </div>
  );
};

export default Haves;