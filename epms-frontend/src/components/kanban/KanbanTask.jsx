// src/components/kanban/KanbanTask.jsx
import React from 'react';
import { FaUser, FaCalendarAlt, FaPaperclip } from 'react-icons/fa';
import { format } from 'date-fns';

const KanbanTask = ({ task, onTaskClick }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      MINOR: '#3B82F6',
      MEDIUM: '#F59E0B',
      MAJOR: '#F97316',
      CRITICAL: '#EF4444'
    };
    return colors[priority] || '#6B7280';
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

  const handleTaskClick = () => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const isOverdue = task.status !== 'DONE' && task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date();

  return (
    <div
      onClick={handleTaskClick}
      className="bg-white rounded border border-gray-200 p-3 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <h4 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2.5">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-2.5">
        <span
          className="text-[9px] font-mono font-medium text-white px-1.5 py-0.5 rounded"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {getPriorityLabel(task.priority)}
        </span>
        {isOverdue && (
          <span className="text-[9px] font-mono font-medium text-white px-1.5 py-0.5 rounded bg-red-600">
            Overdue
          </span>
        )}
        {task.fileAttachment && (
          <span className="text-[9px] font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
            <FaPaperclip className="w-2.5 h-2.5" />
            Attached
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
        <span className="flex items-center gap-1 truncate">
          <FaUser className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{task.assignedToName || 'Unassigned'}</span>
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1 flex-shrink-0">
            <FaCalendarAlt className="w-2.5 h-2.5" />
            {format(new Date(task.dueDate), 'MMM dd')}
          </span>
        )}
      </div>
    </div>
  );
};

export default KanbanTask;