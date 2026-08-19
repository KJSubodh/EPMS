// src/components/employees/EmployeeCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaBriefcase, FaBuilding } from 'react-icons/fa';

const EmployeeCard = ({ user }) => {
  const navigate = useNavigate();

  // Generate consistent vibrant colors based on name
  const getAvatarColor = (name) => {
    const colors = [
      '#7C3AED', '#3B82F6', '#16A34A', '#F59E0B', '#EF4444',
      '#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#14B8A6',
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: '#7C3AED',
      PROJECT_MANAGER: '#3B82F6',
      EMPLOYEE: '#16A34A'
    };
    return colors[role] || '#6B7280';
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Admin',
      PROJECT_MANAGER: 'Project Manager',
      EMPLOYEE: 'Employee'
    };
    return labels[role] || role;
  };

  const avatarColor = getAvatarColor(user.fullName);
  const initials = user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleCardClick = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-2.5 mb-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <FaEnvelope className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className="text-[9px] font-mono font-medium text-white px-1.5 py-0.5 rounded"
          style={{ backgroundColor: getRoleColor(user.role) }}
        >
          {getRoleLabel(user.role)}
        </span>
        <span className="text-[9px] font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
          <FaBuilding className="w-2.5 h-2.5" />
          {user.department || 'No department'}
        </span>
        <span className="text-[9px] font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
          <FaBriefcase className="w-2.5 h-2.5" />
          {user.designation || 'No designation'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-mono">
        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
        <span className={user.isActive ? 'text-green-600 font-medium' : ''}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

export default EmployeeCard;