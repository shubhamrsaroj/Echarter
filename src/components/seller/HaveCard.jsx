import React, { useState } from 'react';
import { Plus, Plane, Trash2, Calendar, Users } from 'lucide-react';
import PostForm from './PostForm';
import DeleteConfirmation from './DeleteConfirmation';

const HaveCard = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handlePlusClick = () => {
    setShowPostForm(!showPostForm);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="w-full max-w-6xl flex mt-6">
      {/* Left section - Haves */}
      <div className="w-1/2 pr-2">
        {/* Header with Title and Plus Button */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Haves</h2>
          <button 
            onClick={handlePlusClick} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded-full transition-colors duration-200 flex items-center justify-center h-8 w-8" 
            aria-label="Add new post"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Card */}
        <div className="bg-white p-3 rounded-md shadow-sm w-full border border-gray-200 relative hover:shadow-md transition-shadow duration-200">
          {/* Delete Button - positioned in top right */}
          <button 
            onClick={handleDeleteClick} 
            className="absolute top-4 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full h-6 w-6 flex items-center justify-center transition-colors duration-200" 
            aria-label="Delete item"
          >
            <Trash2 className="h-6 w-6" />
          </button>

          {/* Card Content */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold pr-6">Cessna Citation X N76856</h3>
            
            <div className="flex mt-2">
              {/* Left part: One Way - Heavy and Price */}
              <div className="flex flex-col mr-6">
                <p className="text-gray-700 text-sm">One Way - Heavy</p>
                <p className="text-green-600 font-bold mt-2">USD 34,000</p>
              </div>
              
              {/* Right section with flight details - shifted left */}
              <div className="text-md text-gray-600 ml-12">
                <div className="flex items-center mb-1">
                  <Plane className="h-3 w-3 mr-1" />
                  <span>New York</span>
                </div>
                <div className="flex items-center mb-1">
                  <Plane className="h-3 w-3 mr-1 transform rotate-180" />
                  <span>Los Angeles</span>
                </div>
                <div className="flex items-center mb-1">
                  <Users className="h-3 w-3 mr-1" />
                  <span>3</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>26 Jan 2025 - 28 Jan 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right section - Post Form */}
      {showPostForm && (
        <div className="w-1/2 pl-2">
          <PostForm />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <DeleteConfirmation onCancel={handleCancelDelete} onConfirm={handleConfirmDelete} />
      )}
    </div>
  );
};

export default HaveCard;