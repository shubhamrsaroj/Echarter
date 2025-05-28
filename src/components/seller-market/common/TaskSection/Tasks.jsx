import React, { useEffect, useContext, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { isPast } from 'date-fns';
import { SellerMarketContext } from '../../../../context/seller-market/SellerMarketContext';
import AddTask from './AddTask';
import { toast } from 'react-toastify';

const Tasks = () => {
  const [showForm, setShowForm] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  
  const { 
    tasks, 
    tasksLoading, 
    tasksError, 
    getAllTasks, 
    userCodes,
    deleteTask,
    updateTask
  } = useContext(SellerMarketContext);

  useEffect(() => {
    getAllTasks();
  }, [getAllTasks]);

  const isDatePassed = (dateString) => {
    if (!dateString) return false;
    try {
      return isPast(new Date(dateString));
    } catch {
      return false;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId || taskId === deletingTaskId) return;
    
    try {
      setDeletingTaskId(taskId);
      const response = await deleteTask(taskId);
      
      if (response && response.success) {
        toast.success('Task deleted successfully');
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      toast.error(error.message || 'Error deleting task');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleToggleTaskCompletion = async (task) => {
    if (!task || task.id === updatingTaskId) return;
    
    try {
      setUpdatingTaskId(task.id);
      
      const taskData = {
        id: task.id,
        isComplete: !task.isComplete
      };
      
      const response = await updateTask(taskData);
      
      if (response && response.success) {
        toast.success(`Task marked as ${!task.isComplete ? 'completed' : 'incomplete'}`);
      } else {
        toast.error('Failed to update task');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const sortTasks = (tasksArray) => {
    if (!tasksArray || !Array.isArray(tasksArray)) return [];
    
    return [...tasksArray].sort((a, b) => {
      // First priority: Match with userCodes
      const aUserMatch = userCodes?.some(user => user.id === a.relUser) ? 1 : 0;
      const bUserMatch = userCodes?.some(user => user.id === b.relUser) ? 1 : 0;
      
      if (aUserMatch !== bUserMatch) {
        return bUserMatch - aUserMatch; // Higher match value first
      }
      
      // Second priority: Completion date (more recent first)
      if (a.completionDate && b.completionDate) {
        return new Date(b.completionDate) - new Date(a.completionDate);
      } else if (a.completionDate) {
        return -1; // a has date, b doesn't
      } else if (b.completionDate) {
        return 1; // b has date, a doesn't
      }
      
      // Third priority: Completed tasks (isComplete true)
      if (a.isComplete !== b.isComplete) {
        return a.isComplete ? 1 : -1; // Non-completed tasks first
      }
      
      return 0;
    });
  };

  if (tasksLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
        <p className="text-black text-xs">Loading tasks...</p>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
        <p className="text-red-500 text-xs">{tasksError}</p>
      </div>
    );
  }

  const sortedTasks = sortTasks(tasks);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-3 border-b border-gray-100">
        <h3 className="font-medium text-black text-sm">Tasks</h3>
        <button 
          className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
          onClick={() => setShowForm(true)}
        >
          <Plus size={12} />
        </button>
      </div>
      
      {showForm && <AddTask onClose={() => setShowForm(false)} />}
      
      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
        {sortedTasks.length === 0 ? (
          <p className="text-black text-xs">No tasks yet</p>
        ) : (
          sortedTasks.map((task) => {
            const matchingUser = userCodes?.find(user => user.id === task.relUser);
            const isDeleting = deletingTaskId === task.id;
            const isUpdating = updatingTaskId === task.id;
            const isDisabled = isDeleting || isUpdating;
            
            return (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                <div className="flex items-center justify-between w-full">
                  <div 
                    className="flex flex-col cursor-pointer"
                    onClick={() => handleToggleTaskCompletion(task)}
                  >
                    <span className={`text-xs font-normal text-black ${task.isComplete ? 'line-through' : ''} ${isUpdating ? 'opacity-50' : ''}`}>
                      {task.memo}
                    </span>
                    {matchingUser && (
                      <span className="text-xs text-black">
                        {matchingUser.userCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <button 
                      className="text-red-500 hover:text-red-600 mr-2 transition-colors"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={isDisabled}
                    >
                      <Trash2 size={14} className={isDisabled ? 'opacity-50' : ''} />
                    </button>
                    {task.system && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 ml-2 flex-shrink-0"></div>
                    )}
                    {!task.system && task.completionDate && isDatePassed(task.completionDate) && (
                      <div className="w-2 h-2 rounded-full bg-red-500 ml-2 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Tasks;