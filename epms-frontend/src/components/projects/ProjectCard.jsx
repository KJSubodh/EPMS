// src/components/projects/ProjectCard.jsx
import React from 'react';
import { FaEdit, FaTrash, FaUsers, FaTasks, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';

const ProjectCard = ({ project, onEdit, onDelete, userRole, userId }) => {
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

  const isAdmin = userRole === 'ADMIN';
  const isProjectManager = userRole === 'PROJECT_MANAGER';
  const isCreator = project.createdBy === userId;
  const isProjectLead = project.members?.some(m => m.userId === userId && m.role === 'PROJECT_LEAD');

  const canEdit = isAdmin || (isProjectManager && (isCreator || isProjectLead));
  const canDelete = isAdmin;

  return (
    <div className="bg-white rounded border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{project.name}</h3>
        <div className="flex gap-0.5">
          {canEdit && (
            <button
              onClick={onEdit}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description || 'No description'}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`text-[9px] font-mono font-medium text-white px-1.5 py-0.5 rounded ${getStatusColor(project.status)}`}>
          {getStatusLabel(project.status)}
        </span>
        <span className="text-[9px] font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
          <FaUsers className="w-2.5 h-2.5" />
          {project.memberCount || 0}
        </span>
        <span className="text-[9px] font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
          <FaTasks className="w-2.5 h-2.5" />
          {project.taskCount || 0}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
        <FaCalendarAlt className="w-2.5 h-2.5" />
        <span>{format(new Date(project.startDate), 'MMM dd')}</span>
        <span>→</span>
        <FaCalendarAlt className="w-2.5 h-2.5" />
        <span>{format(new Date(project.endDate), 'MMM dd, yyyy')}</span>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400">
        {isProjectLead && <span className="text-violet-600 font-medium mr-2">Project Lead</span>}
        Created by {project.createdBy}
      </div>
    </div>
  );
};

export default ProjectCard;