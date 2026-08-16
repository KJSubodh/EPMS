// src/pages/Notifications.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FaBell, FaArrowLeft, FaCheck, FaTrash, FaCircle } from 'react-icons/fa';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../store/slices/notificationSlice';
import PageHero from '../components/common/PageHero';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    if (window.confirm('Mark all notifications as read?')) {
      dispatch(markAllAsRead());
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this notification?')) {
      dispatch(deleteNotification(id));
    }
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

  const getTypeColor = (type) => {
    const colors = {
      'TASK_ASSIGNED': 'border-violet-500',
      'TASK_UPDATED': 'border-blue-500',
      'TASK_COMPLETED': 'border-green-500',
      'PROJECT_CREATED': 'border-purple-500',
      'PROJECT_UPDATED': 'border-amber-500',
      'PROJECT_COMPLETED': 'border-emerald-500',
      'MEMBER_ADDED': 'border-cyan-500',
      'MEMBER_REMOVED': 'border-red-500'
    };
    return colors[type] || 'border-gray-500';
  };

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back
      </button>

      <PageHero
        icon={FaBell}
        iconColor="#7C3AED"
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">All Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                {unreadCount} unread
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
            >
              <FaCheck className="w-3 h-3" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FaBell className="text-5xl mb-4 opacity-20" />
            <p className="text-base font-medium text-gray-500">No notifications</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 hover:bg-gray-50/80 transition-colors border-l-4 ${getTypeColor(notification.type)} ${
                  !notification.isRead ? 'bg-violet-50/20' : ''
                }`}
              >
                <div className="flex-shrink-0 text-2xl mt-0.5">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {notification.taskTitle && (
                      <span className="text-xs text-[#7C3AED] font-medium truncate max-w-[150px]">
                        📌 {notification.taskTitle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="flex items-center gap-1 text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors px-2 py-1 rounded hover:bg-violet-50"
                    >
                      <FaCheck className="w-2.5 h-2.5" />
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50/80 text-center">
            <p className="text-xs text-gray-400">
              Showing {notifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPage;