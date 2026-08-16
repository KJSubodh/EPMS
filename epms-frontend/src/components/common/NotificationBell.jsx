// src/components/common/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaTimes, FaCircle, FaChevronRight } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { 
  fetchNotifications, 
  fetchUnreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteNotification 
} from '../../store/slices/notificationSlice';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, isLoading } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
      
      // Poll every 30 seconds for new notifications
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
        dispatch(fetchNotifications());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
    setIsOpen(false);
    
    // Navigate based on notification type
    if (notification.taskId) {
      navigate(`/tasks/${notification.taskId}`);
    } else if (notification.projectId) {
      navigate(`/projects/${notification.projectId}`);
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this notification?')) {
      dispatch(deleteNotification(id));
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'TASK_ASSIGNED': 'bg-violet-500',
      'TASK_UPDATED': 'bg-blue-500',
      'TASK_COMPLETED': 'bg-green-500',
      'PROJECT_CREATED': 'bg-purple-500',
      'PROJECT_UPDATED': 'bg-amber-500',
      'PROJECT_COMPLETED': 'bg-emerald-500',
      'MEMBER_ADDED': 'bg-cyan-500',
      'MEMBER_REMOVED': 'bg-red-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'TASK_ASSIGNED': '📋',
      'TASK_UPDATED': '🔄',
      'TASK_COMPLETED': '✅',
      'PROJECT_CREATED': '📁',
      'PROJECT_UPDATED': '📝',
      'PROJECT_COMPLETED': '🎯',
      'MEMBER_ADDED': '👤',
      'MEMBER_REMOVED': '🚫'
    };
    return icons[type] || '📌';
  };

  const getTypeLabel = (type) => {
    const labels = {
      'TASK_ASSIGNED': 'Task Assigned',
      'TASK_UPDATED': 'Task Updated',
      'TASK_COMPLETED': 'Task Completed',
      'PROJECT_CREATED': 'Project Created',
      'PROJECT_UPDATED': 'Project Updated',
      'PROJECT_COMPLETED': 'Project Completed',
      'MEMBER_ADDED': 'Member Added',
      'MEMBER_REMOVED': 'Member Removed'
    };
    return labels[type] || 'Notification';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-gray-100 transition-colors relative text-gray-600"
        aria-label="Notifications"
      >
        <FaBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-[#7C3AED] text-white px-1.5 py-0.5 rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[#7C3AED] hover:text-[#6D28D9] font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <FaBell className="text-3xl mb-2 opacity-30" />
                <p className="text-sm font-medium text-gray-500">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group flex items-start gap-3 p-3 hover:bg-gray-50/80 cursor-pointer transition-all duration-150 ${
                      !notification.isRead ? 'bg-violet-50/30 border-l-2 border-[#7C3AED]' : ''
                    }`}
                  >
                    {/* Type indicator dot */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getTypeColor(notification.type)}`}></div>
                    </div>
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 text-base mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-gray-500 truncate">
                          {getTypeLabel(notification.type)}
                        </p>
                        {!notification.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 break-words leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.taskTitle && (
                          <>
                            <span className="text-[10px] text-gray-300">•</span>
                            <span className="text-[10px] text-[#7C3AED] font-medium truncate max-w-[100px]">
                              {notification.taskTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <button
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-all duration-150"
                        title="Delete notification"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50/80">
            {notifications.length > 20 && (
              <button 
                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                className="w-full flex items-center justify-center gap-1 text-xs text-[#7C3AED] hover:text-[#6D28D9] font-medium transition-colors py-1"
              >
                View all notifications
                <FaChevronRight className="w-2.5 h-2.5" />
              </button>
            )}
            {notifications.length <= 20 && notifications.length > 0 && (
              <button 
                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                View all notifications →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;