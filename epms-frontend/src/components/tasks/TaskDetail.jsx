// src/components/tasks/TaskDetail.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaCalendarAlt, FaFlag } from 'react-icons/fa';
import { format } from 'date-fns';
import { fetchTaskById } from '../../store/slices/taskSlice';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTask, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
    }
  }, [dispatch, id]);

  const getPriorityColor = (priority) => {
    const colors = {
      'MINOR': 'bg-gray-400',
      'MEDIUM': 'bg-blue-500',
      'MAJOR': 'bg-yellow-500',
      'CRITICAL': 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-400';
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
      'TODO': 'bg-blue-500',
      'IN_PROGRESS': 'bg-yellow-500',
      'REVIEW': 'bg-purple-500',
      'DONE': 'bg-green-500',
      'BLOCKED': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
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

  if (isLoading || !currentTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  const canEdit = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER' || currentTask.assignedToId === user?.id;

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <FaArrowLeft className="w-3 h-3" />
        Back
      </button>

      {/* Task Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{currentTask.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{currentTask.description || 'No description'}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <span className={`text-[10px] font-medium text-white px-2 py-1 rounded ${getPriorityColor(currentTask.priority)}`}>
              {getPriorityLabel(currentTask.priority)}
            </span>
            <span className={`text-[10px] font-medium text-white px-2 py-1 rounded ${getStatusColor(currentTask.status)}`}>
              {getStatusLabel(currentTask.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FaUser className="w-3 h-3 text-gray-400" />
            <span className="font-medium">Assigned to:</span>
            <span>{currentTask.assignedToName || 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
            <span className="font-medium">Due date:</span>
            <span className="font-mono">{format(new Date(currentTask.dueDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FaFlag className="w-3 h-3 text-gray-400" />
            <span className="font-medium">Estimated hours:</span>
            <span>{currentTask.estimatedHours || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium">Created by:</span>
            <span>{currentTask.createdBy}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-mono">
          Created {format(new Date(currentTask.createdAt), 'MMMM dd, yyyy')}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="mt-6">
        <TaskAttachments taskId={currentTask.id} canEdit={canEdit} />
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <TaskComments taskId={currentTask.id} />
      </div>
    </div>
  );
};

export default TaskDetail;