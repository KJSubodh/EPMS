// src/components/projects/ProjectDetail.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProjectById } from '../../store/slices/projectSlice';
import { fetchTasksByProject } from '../../store/slices/taskSlice';
import { FaArrowLeft, FaUsers, FaTasks, FaCalendarAlt, FaColumns, FaList } from 'react-icons/fa';
import { format } from 'date-fns';
import KanbanBoard from '../kanban/KanbanBoard';  // ✅ Import KanbanBoard

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject, isLoading } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchTasksByProject(id));
  }, [dispatch, id]);

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

  if (isLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;

  return (
    <div>
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <FaArrowLeft className="w-3 h-3" />
        Back to Projects
      </button>

      <div className="bg-white rounded border border-gray-200 p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentProject.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{currentProject.description || 'No description'}</p>
          </div>
          <span className={`text-[10px] font-mono font-medium text-white px-2 py-1 rounded ${getStatusColor(currentProject.status)}`}>
            {getStatusLabel(currentProject.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FaUsers className="w-3 h-3 text-gray-400" />
            <span className="font-medium">Members:</span>
            <span>{currentProject.memberCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FaTasks className="w-3 h-3 text-gray-400" />
            <span className="font-medium">Tasks:</span>
            <span>{currentProject.taskCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
            <span className="font-medium">Start:</span>
            <span className="font-mono">{format(new Date(currentProject.startDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
            <span className="font-medium">End:</span>
            <span className="font-mono">{format(new Date(currentProject.endDate), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Task Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded p-3 text-center">
              <p className="text-xl font-mono font-bold text-gray-900">{tasks.length}</p>
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
          Created by {currentProject.createdBy} on {format(new Date(currentProject.createdAt), 'MMMM dd, yyyy')}
        </div>
      </div>

      {/* ✅ KANBAN BOARD SECTION */}
      <div className="mt-6">
        {/* View Toggle */}
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
          <KanbanBoard projectId={currentProject.id} />
        ) : (
          // List View - Reuse or create a task list component
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No tasks in this project</p>
              ) : (
                tasks.map((task) => (
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