import React from 'react';

const PostForm = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full">
      <h3 className="text-xl font-bold mb-4 text-center">Post</h3>
      
      <textarea
        className="w-full h-40 p-3 border rounded-md mb-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
        defaultValue={`1. Delhi to Mumbai on 28th April, 6 Seats, Citation CJ2 Light Jet, One Way, INR 240000.

2. Trivandrum to Cochin from 28th April to 30th April, 6 Seats, Falcon 7X Heavy.`}
      />
      
      <button className="bg-black text-white px-4 py-2 rounded-md w-full hover:bg-gray-800 transition-colors duration-200 font-medium">
        Post
      </button>
    </div>
  );
};

export default PostForm;