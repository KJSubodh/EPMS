// src/components/tasks/TaskCard.jsx
import React from 'react';
import { FaEdit, FaTrash, FaUser, FaCalendarAlt, FaPaperclip } from 'react-icons/fa';
import { format } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete, onView, onStatusChange, userRole, userId }) => {
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

  const getStatusColor = (status) => {
    const colors = {
      TODO: '#3B82F6',
      IN_PROGRESS: '#F59E0B',
      REVIEW: '#7C3AED',
      DONE: '#16A34A',
      BLOCKED: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      REVIEW: 'Review',
      DONE: 'Done',
      BLOCKED: 'Blocked'
    };
    return labels[status] || status;
  };

  const isOverdue = task.status !== 'DONE' && new Date(task.dueDate) < new Date();
  const isAssignedToMe = task.assignedToId === userId;
  const isAdminOrPM = userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER';

  const canEdit = isAdminOrPM;
  const canDelete = isAdminOrPM;
  const canChangeStatus = (userRole === 'EMPLOYEE' && isAssignedToMe) || isAdminOrPM;

  const handleButtonClick = (e, callback) => {
    e.stopPropagation();
    if (callback) callback();
  };

  return (
    <div
      onClick={onView}
      className="bg-white rounded border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
        <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <button
              onClick={(e) => handleButtonClick(e, onEdit)}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => handleButtonClick(e, onDelete)}
              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description || 'No description'}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className="text-[9px] font-mono font-medium text-white px-1.5 py-0.5 rounded"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {getPriorityLabel(task.priority)}
        </span>
        <span
          className="text-[9px] font-mono font-medium text-white px-1.5 py-0.5 rounded"
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {getStatusLabel(task.status)}
        </span>
        {isOverdue && (
          <span className="text-[9px] font-mono font-medium text-white px-1.5 py-0.5 rounded bg-red-600">
            Overdue
          </span>
        )}
        <span className="text-[9px] font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
          <FaUser className="w-2.5 h-2.5" />
          {task.assignedToName || 'Unassigned'}
        </span>
        {task.fileAttachment && (
          <span className="text-[9px] font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
            <FaPaperclip className="w-2.5 h-2.5" />
            Attached
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
        <FaCalendarAlt className="w-2.5 h-2.5" />
        <span>Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
      </div>

      {canChangeStatus && task.status !== 'DONE' ? (
        <div className="mt-3 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="w-full px-2 py-1 text-[10px] font-mono border border-gray-200 rounded text-gray-600 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      ) : (
        <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400">
          {task.status === 'DONE' ? (
            <span className="text-green-600 font-medium">Completed</span>
          ) : (
            <>Created by {task.createdBy || 'Unknown'}</>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;