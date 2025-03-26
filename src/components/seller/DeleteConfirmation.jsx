import React from "react";

const DeleteConfirmation = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 -mt-8 ml-4 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-black max-w-lg w-full">
        <div className="mb-15"> {/* Increased spacing below text */}
          <p className="text-[14] font-bold leading-relaxed">
            This was not created by you. Click Yes to Delete anyways?
          </p>
        </div>

        <div className="flex justify-between mt-14 gap-10"> {/* Increased gap between buttons */}
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-6 border border-black rounded-sm text-black bg-white font-bold hover:bg-gray-100 transition text-[12]"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-6 bg-black text-white font-bold rounded-sm hover:bg-gray-800 transition text-[12]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
