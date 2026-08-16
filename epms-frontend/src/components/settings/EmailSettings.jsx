// src/components/settings/EmailSettings.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEnvelope, FaBell, FaCalendar, FaCheckCircle, FaComment } from 'react-icons/fa';
import { fetchEmailPreferences, updateEmailPreferences } from '../../store/slices/emailSlice';

const EmailSettings = () => {
  const dispatch = useDispatch();
  const { preferences, isLoading } = useSelector((state) => state.email);
  const [localPreferences, setLocalPreferences] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchEmailPreferences());
  }, [dispatch]);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggle = (key) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const handleSave = () => {
    dispatch(updateEmailPreferences(localPreferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const settings = [
    {
      key: 'taskAssignment',
      icon: FaEnvelope,
      label: 'Task Assignment',
      description: 'Receive emails when tasks are assigned to you',
      color: 'text-violet-500',
      bg: 'bg-violet-50',
    },
    {
      key: 'dueReminders',
      icon: FaCalendar,
      label: 'Due Date Reminders',
      description: 'Get reminded 1 day before a task is due',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      key: 'taskCompletion',
      icon: FaCheckCircle,
      label: 'Task Completion',
      description: 'Notify managers when you complete tasks',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      key: 'dailyDigest',
      icon: FaBell,
      label: 'Daily Digest',
      description: 'Receive a daily summary of your tasks',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      key: 'commentNotifications',
      icon: FaComment,
      label: 'Comment Notifications',
      description: 'Get notified when someone comments on your tasks',
      color: 'text-pink-500',
      bg: 'bg-pink-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <FaEnvelope className="text-[#7C3AED] text-base" />
          <h2 className="text-sm font-semibold text-gray-900">Email Preferences</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] text-white rounded text-xs font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      <div className="space-y-2">
        {settings.map((setting) => {
          const Icon = setting.icon;
          const isEnabled = localPreferences[setting.key] ?? true;
          
          return (
            <div
              key={setting.key}
              className="flex items-center justify-between p-2.5 bg-gray-50 rounded border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg ${setting.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${setting.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">{setting.label}</p>
                  <p className="text-[10px] text-gray-400">{setting.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(setting.key)}
                className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${
                  isEnabled ? 'bg-[#7C3AED]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    isEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <FaEnvelope className="w-2.5 h-2.5" />
          You can change these preferences at any time
        </p>
      </div>
    </div>
  );
};

export default EmailSettings;