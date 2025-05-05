import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, ExternalLink, Download, Trash2, Upload, Loader2, FileText, CheckCircle } from 'lucide-react';
import { fileUploadService } from '../../api/fileuploads/fileUploadService';
import { conversationService } from '../../api/ConversationActivity/GetConversationFilesService';
import { toast } from 'react-toastify';
import SkeletonLoader from './SkeletonLoader';

// Helper function to format file data - outside component to avoid recreations
const formatFileData = (data, messageTitle) => {
  const formattedFiles = [];
  
  if (data?.conversationFiles?.length > 0) {
    formattedFiles.push({
      id: 1,
      title: messageTitle || 'Conversation Files',
      files: data.conversationFiles.map(file => ({
        id: file.id,
        name: file.name,
        uploadedBy: file.createdBy || 'User',
        url: file.url
      }))
    });
  }
  
  if (data?.companyPublicFiles?.length > 0) {
    formattedFiles.push({
      id: 2,
      title: 'Company Files',
      files: data.companyPublicFiles.map(file => ({
        id: file.id,
        name: file.name,
        uploadedBy: file.createdBy || '',
        url: file.url
      }))
    });
  }
  
  return formattedFiles;
};

const FilesBrowser = ({ onClose, chatData, onFilesChange }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrls, setUploadedFileUrls] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [deletingFileIds, setDeletingFileIds] = useState([]);
  
  // Use refs to track API call state
  const isFetchingRef = useRef(false);
  const conversationIdRef = useRef(null);
  
  // Single function to fetch files data
  const fetchFiles = (conversationId) => {
    // Don't fetch if already fetching or no conversationId
    if (!conversationId || isFetchingRef.current) return;
    
    // Set loading state and mark as fetching
    setLoading(true);
    setError(null);
    isFetchingRef.current = true;
    
    // Make the API call
    conversationService.getConversationFiles(conversationId)
      .then(data => {
        const formattedFiles = formatFileData(data, chatData?.message);
        setFiles(formattedFiles);
      })
      .catch(err => {
        console.error('Error fetching files:', err);
        setError(err.message || 'Failed to retrieve conversation files');
      })
      .finally(() => {
        setLoading(false);
        isFetchingRef.current = false;
      });
  };

  // Effect to run on mount or when conversationId changes
  useEffect(() => {
    // Clear state when conversationId changes
    if (conversationIdRef.current !== chatData?.conversationId) {
      setFiles([]);
      setError(null);
      
      // Update the ref to the new conversationId
      conversationIdRef.current = chatData?.conversationId;
      
      // Fetch files if we have a conversationId
      if (chatData?.conversationId) {
        fetchFiles(chatData.conversationId);
      }
    }
    
    // Cleanup
    return () => {
      isFetchingRef.current = false;
    };
  }, [chatData?.conversationId]);

  const handleAddFileClick = () => {
    setShowUploadSection(true);
    setUploadedFileUrls([]);
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    uploadFiles(selectedFiles);
  };

  const uploadFiles = async (selectedFiles) => {
    if (!chatData?.conversationId) {
      toast.error("Conversation ID is required to upload files");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    try {
      const response = await fileUploadService.uploadFiles(
        selectedFiles, 
        'easycharter', 
        (progress) => {
          setUploadProgress(progress);
        },
        chatData.conversationId
      );
      
      // Store the URLs from the response
      if (response && response.length > 0) {
        setUploadedFileUrls(response);
        // Store file names for display
        setUploadedFiles(selectedFiles.map(file => ({
          name: file.name,
          size: file.size
        })));
      }
      
      // Wait a moment to show 100% before completing
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    } catch (error) {
      setUploadError(error.message || 'Failed to upload files');
      setIsUploading(false);
      toast.error(error.message || 'Failed to upload files');
    }
  };

  const handleDeleteFile = async (fileId, sectionId) => {
    if (!fileId) {
      toast.error("File ID is required");
      return;
    }
    
    // Add fileId to the deleting state to show loading indicator
    setDeletingFileIds(prev => [...prev, fileId]);
    
    try {
      // Call the API to delete the file
      await conversationService.deleteFiles(fileId);
      
      // Update the UI to remove the deleted file
      const updatedFiles = [...files];
      const sectionIndex = updatedFiles.findIndex(section => section.id === sectionId);
      
      if (sectionIndex !== -1) {
        updatedFiles[sectionIndex].files = updatedFiles[sectionIndex].files.filter(
          file => file.id !== fileId
        );
        
        setFiles(updatedFiles);
        
        if (onFilesChange) {
          onFilesChange(updatedFiles);
        }
      }
      
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(error.message || "Failed to delete file");
    } finally {
      // Remove fileId from the deleting state
      setDeletingFileIds(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      uploadFiles(droppedFiles);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadSection(false);
    setUploadError(null);
    setUploadedFiles([]);
    setUploadedFileUrls([]);
  };

  const handleShare = async () => {
    if (!uploadedFileUrls.length) {
      toast.error("Please upload files first");
      return;
    }
    
    if (!chatData?.conversationId) {
      toast.error("Conversation ID is required to share files");
      return;
    }
    
    setIsSharing(true);
    
    try {
      await conversationService.addConversationFiles(chatData.conversationId, uploadedFileUrls);
      toast.success("Files shared successfully");
      setShowUploadSection(false);
      setUploadedFileUrls([]);
      
      // Refresh files list after sharing
      fetchFiles(chatData.conversationId);
    } catch (error) {
      toast.error(error.message || "Failed to share files");
    } finally {
      setIsSharing(false);
    }
  };

  // Add the handleDownload function to force download behavior
  const handleDownload = async (url, fileName) => {
    try {
      // Create XHR request
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = function() {
        if (this.status === 200) {
          // Create blob link to download
          const blob = new Blob([this.response], { type: 'application/octet-stream' });
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.style.display = 'none';
          link.href = downloadUrl;
          link.download = fileName || 'downloaded-file';

          // Append to html link element page
          document.body.appendChild(link);
          
          // Start download
          link.click();
          
          // Clean up and remove the link
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
        } else {
          toast.error('Failed to download file. Please try again.');
        }
      };

      xhr.onerror = function() {
        // Handle network errors
        toast.error('Network error occurred while downloading. Please check your connection and try again.');
      };

      // Start the download
      xhr.send();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[450px] w-[500px] max-w-full">
      {/* Header with Files title and + icon */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold ">Files</h2>
          <button
            onClick={handleAddFileClick}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#c1ff72] hover:bg-lime-500 transition"
            aria-label="Add file"
          >
            <Plus className="w-6 h-6 text-black " />
          </button>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
          aria-label="Close files browser"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Upload Section */}
      {showUploadSection && (
        <div className="p-4 border-b">
          <div className="mb-4">
            <h3 className="text-md font-bold mb-2">Upload Files</h3>
            {uploadError && (
              <div className="mb-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                {uploadError}
              </div>
            )}
            
            {isUploading ? (
              // Show upload progress when uploading
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <div className="py-2">
                  <Loader2 className="mx-auto h-8 w-8 text-lime-500 animate-spin" />
                  <p className="mt-1 text-sm text-gray-600">Uploading files...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-lime-500 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : uploadedFiles.length > 0 ? (
              // Show uploaded files when upload complete
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-green-700">Files uploaded successfully</span>
                </div>
                <div className="max-h-40 overflow-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded mb-2">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <div className="text-sm truncate flex-1">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Default upload dropzone
              <div 
                className={`border-2 border-dashed ${isDragging ? 'border-lime-400 bg-lime-50' : 'border-gray-300'} rounded-md p-6 text-center relative`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`mx-auto h-8 w-8 ${isDragging ? 'text-lime-500' : 'text-gray-400'}`} />
                <p className="mt-1 text-sm text-gray-600">
                  {isDragging ? 'Drop files here' : 'Click to select files or drag and drop'}
                </p>
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelUpload}
              className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-100"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={isUploading ? undefined : uploadedFileUrls.length > 0 ? handleShare : () => fileInputRef.current.click()}
              className={`px-4 py-2 rounded-md bg-black text-white ${
                isUploading || isSharing ? 'cursor-not-allowed' : 'hover:bg-gray-800'
              }`}
              disabled={isUploading || isSharing}
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-auto px-4 py-2">
        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                <SkeletonLoader className="mb-4 w-1/3" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, fileIndex) => (
                    <div key={fileIndex} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <SkeletonLoader className="w-3/4 mb-1" />
                        <SkeletonLoader className="w-1/4" height={12} />
                      </div>
                      <div className="flex space-x-2">
                        <SkeletonLoader variant="circle" width={24} height={24} />
                        <SkeletonLoader variant="circle" width={24} height={24} />
                        <SkeletonLoader variant="circle" width={24} height={24} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-full py-8">
            <div className="text-center">
              <div className="rounded-full bg-red-100 p-3 inline-flex mb-3">
                <X className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-red-500 text-sm mb-2">{error}</p>
            </div>
          </div>
        ) : files.length > 0 ? (
          files.map(section => (
            <div key={section.id} className="mb-6">
              <h3 className="text-md font-bold mb-2">{section.title}</h3>
              <div className="space-y-2">
                {section.files.map(file => (
                  <div key={file.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <p className="font-medium text-black">{file.name}</p>
                      {file.uploadedBy && (
                        <p className="text-xs text-black">uploaded by {file.uploadedBy}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-1 hover:bg-gray-200 rounded" 
                        aria-label="Open file"
                      >
                        <ExternalLink className="w-4 h-4 text-black" />
                      </a>
                      <button 
                        className="p-1 hover:bg-gray-200 rounded" 
                        aria-label="Delete file"
                        onClick={() => handleDeleteFile(file.id, section.id)}
                        disabled={deletingFileIds.includes(file.id)}
                      >
                        {deletingFileIds.includes(file.id) ? (
                          <Loader2 className="w-4 h-4 text-black animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-black" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleDownload(file.url, file.name)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        aria-label="Download file"
                      >
                        <Download className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col justify-center items-center h-full py-8 text-gray-500">
            <div className="text-center">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p>No files available</p>
              <p className="text-xs text-gray-400 mt-1">Upload files to share them in this conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesBrowser;