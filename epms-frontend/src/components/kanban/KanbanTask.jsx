// src/components/kanban/KanbanTask.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaTag, FaCheckCircle, FaPaperclip } from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';

const KanbanTask = ({ task }) => {
  const navigate = useNavigate();

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

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task.status !== 'DONE';
  };

  const getAvatarColor = (name) => {
    if (!name) return '#7C3AED';
    const colors = ['#7C3AED', '#3B82F6', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      onClick={() => navigate(`/tasks/${task.id}`)}
      className="group bg-white border border-gray-200 rounded-lg p-3 hover:border-[#7C3AED]/30 hover:shadow-md hover:shadow-[#7C3AED]/5 transition-all cursor-pointer"
    >
      {/* Title & Priority */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-800 group-hover:text-[#7C3AED] transition-colors line-clamp-2 flex-1">
          {task.title}
        </h4>
        <span className={`text-[9px] font-medium text-white px-1.5 py-0.5 rounded flex-shrink-0 ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
      )}

      {/* File Attachment Indicator */}
      {task.fileAttachment && (
        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
          <FaPaperclip className="w-2.5 h-2.5" />
          <span className="truncate max-w-[80px]">{task.fileAttachment}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {/* Assignee */}
          {task.assignedToName ? (
            <div className="flex items-center gap-1.5 group/tooltip">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-medium flex-shrink-0"
                style={{ backgroundColor: getAvatarColor(task.assignedToName) }}
              >
                {task.assignedToName.charAt(0)}
              </div>
              <span className="truncate max-w-[50px]">{task.assignedToName}</span>
            </div>
          ) : (
            <span className="text-gray-300 text-[10px]">Unassigned</span>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <FaCalendarAlt className={`w-2.5 h-2.5 ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-400'}`} />
              <span className={`text-[10px] ${isOverdue(task.dueDate) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            </div>
          )}
        </div>

        {/* Quick indicator for completed */}
        {task.status === 'DONE' && (
          <FaCheckCircle className="w-3.5 h-3.5 text-green-500" />
        )}
      </div>
    </div>
  );
};

export default KanbanTask;