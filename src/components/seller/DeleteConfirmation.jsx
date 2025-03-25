import React from 'react';

const DeleteConfirmation = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full">
        <div className="mb-6">
          <p className="text-center font-medium">This was not created by you.</p>
          <p className="text-center font-medium">Confirm you want to proceed?</p>
        </div>
        
        <div className="flex justify-between gap-4">
          <button 
            onClick={onCancel} 
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          
          <button 
            onClick={onConfirm} 
            className="flex-1 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;