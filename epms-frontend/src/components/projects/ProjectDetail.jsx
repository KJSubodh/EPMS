// src/components/projects/ProjectDetail.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProjectById } from '../../store/slices/projectSlice';
import { fetchTasksByProject } from '../../store/slices/taskSlice';
import { FaArrowLeft, FaUsers, FaTasks, FaCalendarAlt, FaColumns, FaList, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import KanbanBoard from '../kanban/KanbanBoard';

const ProjectDetail = ({ project: propProject, onClose, userRole, userId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject, isLoading } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const [viewMode, setViewMode] = useState('board');

  // Use prop project if provided, otherwise fetch from API
  const project = propProject || currentProject;

  useEffect(() => {
    // Only fetch if we have an ID from URL params and no prop project
    if (id && !propProject) {
      dispatch(fetchProjectById(id));
      dispatch(fetchTasksByProject(id));
    }
  }, [dispatch, id, propProject]);

  // If we have a prop project, fetch its tasks
  useEffect(() => {
    if (propProject?.id) {
      dispatch(fetchTasksByProject(propProject.id));
    }
  }, [dispatch, propProject]);

  const getStatusColor = (status) => {
    const colors = {
      PLANNING: 'bg-gray-500',
      ACTIVE: 'bg-green-500',
      ON_HOLD: 'bg-amber-500',
      COMPLETED: 'bg-violet-500',
      CANCELLED: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PLANNING: 'Planning',
      ACTIVE: 'Active',
      ON_HOLD: 'On Hold',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    };
    return labels[status] || status;
  };

  // Handle loading state
  if (isLoading && !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const completedTasks = tasks?.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0;

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
    <div className="p-6">
      {/* Header with close button for modal mode */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            <span className={`text-[10px] font-mono font-medium text-white px-2 py-1 rounded ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{project.description || 'No description'}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <FaUsers className="w-3 h-3 text-gray-400" />
          <span className="font-medium">Members:</span>
          <span>{project.memberCount || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <FaTasks className="w-3 h-3 text-gray-400" />
          <span className="font-medium">Tasks:</span>
          <span>{tasks?.length || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
          <span className="font-medium">Start:</span>
          <span className="font-mono">{formatDate(project.startDate)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
          <span className="font-medium">End:</span>
          <span className="font-mono">{formatDate(project.endDate)}</span>
        </div>
      </div>

      {/* Task Progress */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Task Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gray-50 border border-gray-100 rounded p-3 text-center">
            <p className="text-xl font-mono font-bold text-gray-900">{tasks?.length || 0}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Tasks</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded p-3 text-center">
            <p className="text-xl font-mono font-bold text-green-600">{completedTasks}</p>
            <p className="text-[10px] text-green-600 uppercase tracking-wider">Completed</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded p-3 text-center">
            <p className="text-xl font-mono font-bold text-amber-600">{inProgressTasks}</p>
            <p className="text-[10px] text-amber-600 uppercase tracking-wider">In Progress</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-mono">
        Created by {project.createdBy || 'Unknown'} on {formatDate(project.createdAt)}
      </div>

      {/* Kanban Board Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'board'
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaColumns className="w-3 h-3" />
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaList className="w-3 h-3" />
              List
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {viewMode === 'board' ? 'Drag and drop to update status' : 'View all tasks in a list'}
          </span>
        </div>

        {/* Board View */}
        {viewMode === 'board' ? (
          <KanbanBoard projectId={project.id} />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-2">
              {tasks?.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No tasks in this project</p>
              ) : (
                tasks?.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.status}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {task.assignedToName || 'Unassigned'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;