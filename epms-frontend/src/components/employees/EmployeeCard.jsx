// src/components/employees/EmployeeCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaBriefcase, FaBuilding, FaUser } from 'react-icons/fa';

const EmployeeCard = ({ user }) => {
  const navigate = useNavigate();

  // Generate consistent vibrant colors based on name
  const getAvatarColor = (name) => {
    const colors = [
      '#7C3AED', // Violet
      '#3B82F6', // Blue
      '#16A34A', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#EC4899', // Pink
      '#14B8A6', // Teal
    ];
    
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getRoleConfig = (role) => {
    const configs = {
      'ADMIN': { 
        bg: 'bg-violet-500', 
        text: 'Admin',
        lightBg: 'bg-violet-50',
        border: 'border-violet-200',
        textColor: 'text-violet-700',
        dot: 'bg-violet-500'
      },
      'PROJECT_MANAGER': { 
        bg: 'bg-blue-500', 
        text: 'Project Manager',
        lightBg: 'bg-blue-50',
        border: 'border-blue-200',
        textColor: 'text-blue-700',
        dot: 'bg-blue-500'
      },
      'EMPLOYEE': { 
        bg: 'bg-green-500', 
        text: 'Employee',
        lightBg: 'bg-green-50',
        border: 'border-green-200',
        textColor: 'text-green-700',
        dot: 'bg-green-500'
      }
    };
    return configs[role] || configs['EMPLOYEE'];
  };

  const roleConfig = getRoleConfig(user.role);
  const avatarColor = getAvatarColor(user.fullName);
  const initials = user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleCardClick = () => {
    // Navigate to the unified profile page with the user ID
    navigate(`/profile/${user.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-gray-200 hover:border-[#7C3AED]/30 hover:shadow-lg hover:shadow-[#7C3AED]/10 transition-all duration-200 cursor-pointer"
    >
      <div className="p-5">
        {/* Header - Avatar & Name */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="relative flex-shrink-0">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${user.isActive ? 'bg-green-500 shadow-sm shadow-green-500/30' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</h3>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${user.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FaEnvelope className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Details - Clean list with icons */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-gray-100/50 transition-colors duration-200">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <FaBuilding className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <span className="text-xs text-gray-600 truncate">{user.department || 'No department'}</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-gray-100/50 transition-colors duration-200">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <FaBriefcase className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <span className="text-xs text-gray-600 truncate">{user.designation || 'No designation'}</span>
          </div>
        </div>

        {/* Footer - Status & Role */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full ${roleConfig.lightBg} ${roleConfig.textColor} border ${roleConfig.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${roleConfig.dot}`}></span>
              {roleConfig.text}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            <span className={`text-[10px] font-medium ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;