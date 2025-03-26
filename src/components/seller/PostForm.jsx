import React, { useRef, useState } from "react";
import { useSellerContext } from '../../context/seller/SellerContext';

const PostForm = ({ onClose }) => {
  const contentRef = useRef(null);
  const [postError, setPostError] = useState(null);
  const { createHaves, loading, postSuccess } = useSellerContext();
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePost = async () => {
    if (!contentRef.current) return;

    const text = contentRef.current.innerText.trim();
    
    if (!text) {
      setPostError("Post content cannot be empty");
      return;
    }

    try {
      await createHaves(text);
      
      // Show success message
      setShowSuccess(true);

      // Clear content
      if (contentRef.current) {
        contentRef.current.innerText = '';
      }

      // Close form after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        if (onClose) onClose();
      }, 2000);
      
    } catch (error) {
      setPostError(error.message || "Failed to post");
    }
  };

  return (
    <div className="border border-black rounded-md p-4 w-[500px] h-[400px] bg-white shadow-md">
      <h3 className="text-center font-bold mb-2">Post</h3>
      
      {/* Editable div to allow typing */}
      <div 
        ref={contentRef} 
        contentEditable 
        className="w-full p-2 border border-black rounded-md text-sm bg-white min-h-[200px] outline-none" 
        suppressContentEditableWarning={true}
        placeholder="Enter your post content here..."
      >
        1. Delhi to Mumbai on 26th April, 6 Seats, Citation CJ2 Light Jet. One Way. INR 240000. N67456 <br /> <br />
        2. Transient at Cochin from 26th April to 30th April, 6 Seats, Falcon 7X Heavy.
      </div>

      {postError && (
        <div className="text-red-500 text-sm mt-2 text-center">
          {postError}
        </div>
      )}

      {showSuccess && postSuccess && (
        <div className="text-green-500 text-sm mt-2 text-center">
          {postSuccess}
        </div>
      )}

      <div className="flex justify-center gap-6 mt-6">
        <button 
          className="bg-black text-white px-8 py-2 rounded-sm text-[12px] font-poppins font-semibold"
          onClick={handlePost}
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
        <button 
          className="border border-black px-8 py-2 rounded-sm text-[12px] font-poppins font-semibold" 
          onClick={onClose}
          disabled={loading}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PostForm;
