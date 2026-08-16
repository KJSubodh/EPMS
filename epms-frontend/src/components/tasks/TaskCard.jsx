import React from 'react';
import { FaEdit, FaTrash, FaCalendar, FaUser, FaFlag, FaPaperclip } from 'react-icons/fa';
import { format } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete, onView, onStatusChange, userRole, userId }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      MINOR: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      MAJOR: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      REVIEW: 'bg-blue-100 text-blue-800',
      DONE: 'bg-green-100 text-green-800',
      BLOCKED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = task.status !== 'DONE' && new Date(task.dueDate) < new Date();
  const isAssignedToMe = task.assignedToId === userId;
  const isAdminOrPM = userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER';

  const canChangeStatus = (userRole === 'EMPLOYEE' && isAssignedToMe) || isAdminOrPM;

  return (
    <div
      onClick={onView}
      className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-gray-300 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
          {task.title}
        </h3>
        {(isAdminOrPM || (userRole === 'EMPLOYEE' && isAssignedToMe)) && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAdminOrPM && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Edit task"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
            )}
            {isAdminOrPM && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete task"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
        {task.description || 'No description provided'}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
          <FaFlag className="w-3 h-3" />
          {task.priority}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
        {isOverdue && (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Overdue
          </span>
        )}
        {task.fileAttachment && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            <FaPaperclip className="w-3 h-3" />
            Attached
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="space-y-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <FaUser className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">{task.assignedToName || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendar className="w-3.5 h-3.5 text-gray-400" />
          <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Status Update */}
      {canChangeStatus && task.status !== 'DONE' && (
        <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      )}

      {task.status === 'DONE' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-green-600 font-medium">✅ Task Completed</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;