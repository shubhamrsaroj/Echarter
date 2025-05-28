import React, { useContext, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { SellerMarketContext } from '../../../../context/seller-market/SellerMarketContext';

const AddTask = ({ onClose }) => {
  const [newTask, setNewTask] = useState({
    memo: '',
    relUser: '',
    completionDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { userCodes, addTask, companyId } = useContext(SellerMarketContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTask.memo.trim() === '') return;
    
    setIsSubmitting(true);
    
    try {
      // Format the task data according to the API requirements
      const taskData = {
        "ownerCom": companyId,
        "relUser": newTask.relUser,
        "memo": newTask.memo,
        "isTask": true,
        "isComplete": false,
        "system": false,
        "category": "activity",
        "completionDate": newTask.completionDate ? new Date(newTask.completionDate).toISOString() : null
      };
      
      await addTask(taskData);
      toast.success("Task added successfully");
      setNewTask({ memo: '', relUser: '', completionDate: '' });
      onClose();
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error(error.message || "Failed to add task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 border-b border-gray-100">
      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            display: none;
          }
        `}
      </style>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">New Task</h4>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
        
        <div>
          <textarea
            name="memo"
            placeholder="Todo"
            value={newTask.memo}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded p-2 text-sm min-h-[80px]"
            required
          />
        </div>
        
        <div>
          <select
            name="relUser"
            value={newTask.relUser}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white"
          >
            <option value="">Select User</option>
            {userCodes?.map(user => (
              <option key={user.id} value={user.id}>
                {user.userCode}
              </option>
            ))}
          </select>
        </div>
        
        <div className="relative">
          <input
            type="date"
            name="completionDate"
            value={newTask.completionDate}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded p-2 text-sm pr-10"
            style={{ 
              opacity: 1,
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
          />
          <div 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
            onClick={() => {
              const dateInput = document.querySelector('input[name="completionDate"]');
              if (dateInput) {
                dateInput.showPicker();
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#4DA0FF] text-center text-white font-medium py-2.5 px-4 rounded-full hover:bg-[#3B8CE8] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 size={18} className="animate-spin mr-2" />
              Creating...
            </span>
          ) : (
            "Create"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddTask; 