// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
  FaBell,
  FaSearch
} from 'react-icons/fa';
import { logoutUser } from '../../store/slices/authSlice';
import NotificationBell from '../common/NotificationBell';
import { openSearch } from '../../store/slices/searchSlice';

const Navbar = ({ sidebarOpen, setSidebarOpen, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 h-14 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden text-gray-600 dark:text-gray-300"
            aria-label="Toggle sidebar"
          >
            <FaBars className="text-lg" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#7C3AED] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">TF</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-white hidden sm:block">
              TaskFlow
            </span>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4 lg:mx-8">
          <button
            onClick={() => dispatch(openSearch())}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <FaSearch className="w-4 h-4" />
            <span className="flex-1 text-left text-gray-500 dark:text-gray-400">Search...</span>
            <kbd className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 font-mono text-gray-400 dark:text-gray-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={() => dispatch(openSearch())}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden text-gray-600 dark:text-gray-300"
          >
            <FaSearch className="text-base" />
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-7 h-7 bg-[#7C3AED] rounded-full flex items-center justify-center text-white text-xs font-medium">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.fullName?.split(' ')[0] || 'User'}
              </span>
              <FaChevronDown className={`hidden lg:block text-gray-400 dark:text-gray-500 text-[10px] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded ${
                      user?.role === 'ADMIN'
                        ? 'bg-[#7C3AED] text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {user?.role || 'Employee'}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FaUserCircle className="text-gray-400 dark:text-gray-500 text-sm" />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FaSignOutAlt className="text-sm" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;