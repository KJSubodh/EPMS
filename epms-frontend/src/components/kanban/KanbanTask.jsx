// src/components/kanban/KanbanTask.jsx
import React from 'react';
import { FaUser, FaCalendar, FaFlag, FaPaperclip } from 'react-icons/fa';
import { format } from 'date-fns';

const KanbanTask = ({ task, onTaskClick }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      MINOR: 'bg-blue-100 text-blue-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      MAJOR: 'bg-orange-100 text-orange-700',
      CRITICAL: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      MINOR: 'Minor',
      MEDIUM: 'Medium',
      MAJOR: 'Major',
      CRITICAL: 'Critical'
    };
    return labels[priority] || priority;
  };

  // ✅ Handle click on the task card
  const handleTaskClick = () => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  // Check if overdue (only if not done)
  const isOverdue = task.status !== 'DONE' && task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date();

  return (
    <div
      onClick={handleTaskClick}
      className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
    >
      {/* Task Title */}
      <h4 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2.5">
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
          <FaFlag className="inline w-2.5 h-2.5 mr-0.5" />
          {getPriorityLabel(task.priority)}
        </span>
        {isOverdue && (
          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            ⚠️ Overdue
          </span>
        )}
        {task.fileAttachment && (
          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            <FaPaperclip className="inline w-2.5 h-2.5 mr-0.5" />
            Attached
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <div className="flex items-center gap-2">
          <FaUser className="w-3 h-3" />
          <span>{task.assignedToName || 'Unassigned'}</span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <FaCalendar className="w-3 h-3" />
            <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
          </div>
        )}
      </div>

      {/* Subtle indicator that task is clickable */}
      <div className="mt-2 pt-1.5 border-t border-gray-100 text-[8px] text-gray-300 text-center">
        Click to view details
      </div>
    </div>
  );
};

export default KanbanTask;