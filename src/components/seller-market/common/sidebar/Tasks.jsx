import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Review flight schedules", completed: false },
    { id: 2, title: "Update customer records", completed: false },
    { id: 3, title: "Process pending quotes", completed: false }
  ]);

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      title: `New Task ${tasks.length + 1}`,
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-3 border-b border-gray-100">
        <h3 className="font-medium text-gray-900 text-sm">Tasks</h3>
        <button 
          onClick={addTask}
          className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-xs">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
              <div className="flex items-center space-x-2 flex-1">
                <input 
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-xs flex-1 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                  {task.title}
                </span>
              </div>
              <button 
                onClick={() => removeTask(task.id)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks; 