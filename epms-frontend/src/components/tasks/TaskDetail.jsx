// src/components/tasks/TaskDetail.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaUser, FaCalendarAlt, FaFlag, FaProjectDiagram, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';

const TaskDetail = ({ task, onClose, userRole, userId, onStatusChange }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  if (!task) {
    return null;
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'MINOR': 'bg-blue-100 text-blue-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'MAJOR': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'MINOR': 'Minor',
      'MEDIUM': 'Medium',
      'MAJOR': 'Major',
      'CRITICAL': 'Critical'
    };
    return labels[priority] || priority;
  };

  const getStatusColor = (status) => {
    const colors = {
      'TODO': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'REVIEW': 'bg-blue-100 text-blue-800',
      'DONE': 'bg-green-100 text-green-800',
      'BLOCKED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'TODO': 'To Do',
      'IN_PROGRESS': 'In Progress',
      'REVIEW': 'Review',
      'DONE': 'Done',
      'BLOCKED': 'Blocked'
    };
    return labels[status] || status;
  };

  const isOverdue = task.status !== 'DONE' && task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date();
  const canEdit = userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER' || task.assignedToId === userId;

  // Format date helper
  const formatDate = (date) => {
    if (!date) return '—';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return '—';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4 flex items-start justify-between rounded-t-lg">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                <FaFlag className="inline w-3 h-3 mr-1" />
                {getPriorityLabel(task.priority)}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
              {isOverdue && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-800">
                  ⚠️ Overdue
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{task.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{task.projectName || 'No project'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {task.description || 'No description provided'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            <div>
              <p className="text-xs text-gray-500 font-medium">Assigned To</p>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-1.5">
                <FaUser className="w-3 h-3 text-gray-400" />
                {task.assignedToName || 'Unassigned'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Due Date</p>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-1.5">
                <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                {formatDate(task.dueDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Estimated Hours</p>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-1.5">
                <FaClock className="w-3 h-3 text-gray-400" />
                {task.estimatedHours || '—'} hrs
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Created By</p>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-1.5">
                <FaUser className="w-3 h-3 text-gray-400" />
                {task.createdBy || '—'}
              </p>
            </div>
          </div>

          {/* Status Update (if editable) */}
          {canEdit && task.status !== 'DONE' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="text-sm font-medium text-gray-700 block mb-2">Update Status</label>
              <select
                value={task.status}
                onChange={(e) => {
                  onStatusChange(task.id, e.target.value);
                  onClose();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          )}

          {/* Attachments */}
          <div className="mb-6">
            <TaskAttachments taskId={task.id} canEdit={canEdit} />
          </div>

          {/* Comments */}
          <div>
            <TaskComments taskId={task.id} />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 rounded-b-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">
              Created {formatDate(task.createdAt)}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;