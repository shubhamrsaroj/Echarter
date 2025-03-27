import React, { useRef, useState } from "react";
import { useSellerContext } from "../../../context/seller/SellerContext";
import { CheckCircle } from "lucide-react";

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
        contentRef.current.innerText = "";
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        if (onClose) onClose();
      }, 3000);
    } catch (error) {
      setPostError(error.message || "Failed to post");
    }
  };

  return (
    <>
      {/* Success Toast Message */}
      {showSuccess && postSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <CheckCircle className="mr-2" />
          <span>{postSuccess}</span>
        </div>
      )}

      {/* Post Form UI */}
      <div className="border border-black rounded-md p-4 w-[500px] max-w-full  h-[400px] bg-white shadow-md mx-auto ">
        <h3 className="text-center font-bold mb-2">Post</h3>

        {/* Editable div for user input */}
        <div
          ref={contentRef}
          contentEditable
          className="w-full p-2 border border-black rounded-md text-sm bg-white min-h-[200px] outline-none overflow-auto"
          suppressContentEditableWarning={true}
        >
          1. Delhi to Mumbai on 26th April, 6 Seats, Citation CJ2 Light Jet. One Way. INR 240000. N67456 <br /> <br />
          2. Transient at Cochin from 26th April to 30th April, 6 Seats, Falcon 7X Heavy.
        </div>

        {postError && (
          <div className="text-red-500 text-sm mt-2 text-center">{postError}</div>
        )}

        <div className="flex justify-center gap-8 mt-6">
          <button
            className="bg-black text-white px-8 py-2 rounded-sm text-[12px] font-semibold disabled:opacity-50"
            onClick={handlePost}
            disabled={loading}
          >
            {loading ? "Posting..." : "Post"}
          </button>
          <button
            className="border border-black px-8 py-2 rounded-sm text-[12px] font-semibold disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default PostForm;
