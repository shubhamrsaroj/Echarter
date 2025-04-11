import React, { useRef, useState } from "react";
import { useSellerContext } from "../../../context/seller/SellerContext";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const MAX_CHARS = 600;

const PostForm = ({ onClose }) => {
  const contentRef = useRef(null);
  const [postError, setPostError] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const { createHaves, loading, postSuccess } = useSellerContext();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInput = (e) => {
    const text = e.target.innerText;
    setCharCount(text.length);
    
    if (text.length > MAX_CHARS) {
      e.target.innerText = text.slice(0, MAX_CHARS);
      setCharCount(MAX_CHARS);
    }
  };

  const handlePost = async () => {
    if (!contentRef.current) return;

    // Get text and remove extra whitespace and line breaks
    const text = contentRef.current.innerText
      .trim()
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ");

    if (!text) {
      setPostError("Post content cannot be empty");
      toast.error("Post content cannot be empty", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (text.length > MAX_CHARS) {
      setPostError(`Content exceeds ${MAX_CHARS} characters limit`);
      toast.error(`Content exceeds ${MAX_CHARS} characters limit`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await createHaves(text);
      
      if (response?.success) {
        // Clear the input immediately on success
        if (contentRef.current) {
          contentRef.current.innerText = "";
          setCharCount(0);
        }
        
        setShowSuccess(true);
        toast.success(response.message || "Successfully created!", {
          position: "top-right",
          autoClose: 3000,
        });

        // Close the form after a short delay
        setTimeout(() => {
          setShowSuccess(false);
          if (onClose) onClose();
        }, 1000); // Reduced to 1 second for better UX
      } else {
        throw new Error(response?.message || "Failed to create post");
      }
    } catch (error) {
      setPostError(error.message || "Failed to post");
      toast.error(error.message || "Failed to post", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      {showSuccess && postSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <CheckCircle className="mr-2" />
          <span>{postSuccess}</span>
        </div>
      )}

      {postError && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center shadow-lg">
          <AlertCircle className="mr-2" />
          <span>{postError}</span>
        </div>
      )}

      <div className="border border-black rounded-md p-4 w-[500px] max-w-full h-[400px] bg-white shadow-md mx-auto">
        <h3 className="text-center font-bold mb-2">Post</h3>

        <div className="relative">
          <div
            ref={contentRef}
            contentEditable
            onInput={handleInput}
            className="w-full p-2 border border-black rounded-md text-sm bg-white min-h-[200px] outline-none overflow-auto"
            suppressContentEditableWarning={true}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {charCount}/{MAX_CHARS}
          </div>
        </div>

        {postError && (
          <div className="text-red-500 text-sm mt-2 text-center">{postError}</div>
        )}

        <div className="flex justify-center gap-8 mt-6">
          <button
            className="bg-black text-white px-8 py-2 rounded-sm text-[12px] font-semibold disabled:opacity-50"
            onClick={handlePost}
            disabled={loading || charCount === 0 || charCount > MAX_CHARS}
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
