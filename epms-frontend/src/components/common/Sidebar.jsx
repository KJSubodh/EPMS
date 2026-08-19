// src/components/common/Sidebar.jsx
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaProjectDiagram,
  FaTasks,
  FaUsers,
  FaChartBar,
  FaTimes,
  FaSignOutAlt,
  FaUserCog,
  FaCog,
  FaColumns,
  FaUser,
  FaChartLine // ✅ Added this import
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ sidebarOpen, setSidebarOpen, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        window.innerWidth < 1024 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const proceedLogout = async () => {
    setShowLogoutConfirm(false);
    await handleLogout();
  };

  // ✅ Menu items with role-based visibility
  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', roles: ['ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { path: '/projects', icon: FaProjectDiagram, label: 'Projects', roles: ['ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { path: '/tasks', icon: FaTasks, label: 'Tasks', roles: ['ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    
    // Board - only for Admin & PM
    ...(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER' ? [
      { path: '/board', icon: FaColumns, label: 'Board', roles: ['ADMIN', 'PROJECT_MANAGER'] }
    ] : []),
    
    // My Board - only for Employee
    ...(user?.role === 'EMPLOYEE' ? [
      { path: '/my-board', icon: FaUser, label: 'My Board', roles: ['EMPLOYEE'] }
    ] : []),
    
    // ✅ Analytics - only for Admin & PM
    ...(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER' ? [
      { path: '/analytics', icon: FaChartLine, label: 'Analytics', roles: ['ADMIN', 'PROJECT_MANAGER'] }
    ] : []),
    
    // Employees - only for Admin
    ...(user?.role === 'ADMIN' ? [
      { path: '/employees', icon: FaUsers, label: 'Employees', roles: ['ADMIN'] }
    ] : []),
    
    // User Management - only for Admin
    ...(user?.role === 'ADMIN' ? [
      { path: '/admin/users', icon: FaUserCog, label: 'User Management', roles: ['ADMIN'] }
    ] : []),
    
    { path: '/reports', icon: FaChartBar, label: 'Reports', roles: ['ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE'] },
    { path: '/settings', icon: FaCog, label: 'Settings', roles: ['ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE'] },
  ];

  const isPathActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-[#151321] z-50 w-[240px] transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 border-r border-white/5`}
      >
        {/* Header */}
        <div className="flex items-center h-14 px-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#7C3AED] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TF</span>
            </div>
            <span className="text-sm font-semibold text-white">TaskFlow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-white/10 transition-colors lg:hidden ml-auto text-white/40 hover:text-white"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-3 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#7C3AED] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-[11px] text-white/40 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-2 py-3 overflow-y-auto h-[calc(100vh-180px)]">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isPathActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                    active
                      ? 'bg-[#7C3AED] text-white'
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <Icon className={`text-sm ${active ? 'text-white' : 'text-white/40'}`} />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {active && (
                    <span className="w-1 h-5 bg-white rounded-full"></span>
                  )}
                  {item.path === '/admin/users' && user?.role === 'ADMIN' && (
                    <span className="text-[9px] font-medium bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                  {item.path === '/analytics'}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/5">
          <button
            onClick={confirmLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
          >
            <FaSignOutAlt className="text-sm" />
            <span>Logout</span>
          </button>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-white/20 font-mono">v2.0.0</span>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[#151321] rounded-lg border border-white/10 p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Confirm Logout</h3>
            <p className="text-sm text-white/60 mb-6">
              Are you sure you want to logout? You'll need to login again to access your account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={proceedLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;