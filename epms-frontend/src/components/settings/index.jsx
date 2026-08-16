// src/components/settings/index.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaMoon, 
  FaSun, 
  FaUser, 
  FaBell, 
  FaShieldAlt, 
  FaPalette,
  FaGlobe,
  FaSave,
  FaUserCircle,
  FaCog,
  FaCheckCircle,
  FaArrowRight,
  FaEnvelope  // ✅ ADD THIS
} from 'react-icons/fa';
import PageHero from '../common/PageHero';
import EmailSettings from './EmailSettings';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('userSettings');
    return saved ? JSON.parse(saved) : {
      notifications: true,
      emailAlerts: true,
      twoFactor: false,
      language: 'en',
      timezone: 'UTC+5:30'
    };
  });

  const [activeTab, setActiveTab] = useState('appearance');
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const ThemeToggle = () => (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`relative w-12 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${
        darkMode ? 'bg-[#7C3AED]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center transition-transform duration-200 ${
          darkMode ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {darkMode ? (
          <FaMoon className="w-2.5 h-2.5 text-[#7C3AED]" />
        ) : (
          <FaSun className="w-2.5 h-2.5 text-yellow-500" />
        )}
      </span>
    </button>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => {
    const [isEnabled, setIsEnabled] = useState(enabled);

    useEffect(() => {
      setIsEnabled(enabled);
    }, [enabled]);

    const handleClick = () => {
      const newValue = !isEnabled;
      setIsEnabled(newValue);
      if (onChange) {
        onChange();
      }
    };

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div className="flex-1 pr-4">
          <p className="text-xs font-medium text-gray-700">{label}</p>
          {description && (
            <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleClick}
            className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none ${
              isEnabled ? 'bg-[#7C3AED]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    );
  };

  // ✅ ADD EMAIL TAB
  const tabs = [
    { id: 'appearance', icon: FaPalette, label: 'Appearance' },
    { id: 'profile', icon: FaUser, label: 'Profile' },
    { id: 'notifications', icon: FaBell, label: 'Notifications' },
    { id: 'security', icon: FaShieldAlt, label: 'Security' },
    { id: 'preferences', icon: FaGlobe, label: 'Preferences' },
    { id: 'email', icon: FaEnvelope, label: 'Email Preferences' },  // ✅ ADD THIS
  ];

  return (
    <div className="space-y-4">
      {/* Unified Hero */}
      <PageHero
        icon={FaCog}
        iconColor="#7C3AED"
        title="Settings"
        subtitle="Manage your application preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded border border-gray-200 p-1.5 sticky top-20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded text-xs transition-colors ${
                    isActive
                      ? 'bg-[#7C3AED] text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`text-sm ${isActive ? 'text-white' : ''}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1 h-5 bg-white rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2.5 mb-4">
                <FaPalette className="text-[#7C3AED] text-base" />
                <h2 className="text-sm font-semibold text-gray-900">Appearance</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Dark Mode</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Current Theme</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {darkMode ? 'Dark Theme is active' : 'Light Theme is active'}
                    </p>
                  </div>
                  <span className={darkMode ? 'text-[#7C3AED]' : 'text-yellow-500'}>
                    {darkMode ? <FaMoon className="text-base" /> : <FaSun className="text-base" />}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Accent Color</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Violet (Default)</p>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#7C3AED] ring-2 ring-[#7C3AED] ring-offset-1 cursor-pointer"></div>
                    <div className="w-6 h-6 rounded-full bg-blue-600 ring-2 ring-transparent hover:ring-blue-600/50 cursor-pointer transition-all"></div>
                    <div className="w-6 h-6 rounded-full bg-green-600 ring-2 ring-transparent hover:ring-green-600/50 cursor-pointer transition-all"></div>
                    <div className="w-6 h-6 rounded-full bg-red-600 ring-2 ring-transparent hover:ring-red-600/50 cursor-pointer transition-all"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <FaUserCircle className="text-[#7C3AED] text-base" />
                  <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                >
                  View Full Profile
                  <FaArrowRight className="text-[10px]" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="w-12 h-12 bg-[#7C3AED] rounded-full flex items-center justify-center text-white text-base font-semibold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-[10px] text-gray-500">{user?.email}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-medium px-1.5 py-0.5 bg-[#7C3AED] text-white rounded">
                      {user?.role || 'Employee'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Full Name</label>
                    <input
                      type="text"
                      value={user?.fullName || ''}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 cursor-not-allowed opacity-75"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 cursor-not-allowed opacity-75"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Department</label>
                    <input
                      type="text"
                      value={user?.department || 'Not set'}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 cursor-not-allowed opacity-75"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Designation</label>
                    <input
                      type="text"
                      value={user?.designation || 'Not set'}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 cursor-not-allowed opacity-75"
                      disabled
                    />
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full py-2 text-xs font-medium text-[#7C3AED] bg-[#7C3AED]/5 rounded hover:bg-[#7C3AED]/10 transition-colors border border-[#7C3AED]/20 flex items-center justify-center gap-2"
                >
                  <FaUserCircle className="text-sm" />
                  Go to Full Profile
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2.5 mb-4">
                <FaBell className="text-[#7C3AED] text-base" />
                <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <ToggleSwitch
                  enabled={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                  label="Push Notifications"
                  description="Receive notifications in-app"
                />
                <ToggleSwitch
                  enabled={settings.emailAlerts}
                  onChange={() => handleToggle('emailAlerts')}
                  label="Email Alerts"
                  description="Receive email notifications for important updates"
                />
                <ToggleSwitch
                  enabled={true}
                  onChange={() => {}}
                  label="Task Updates"
                  description="Get notified when tasks are assigned or updated"
                />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2.5 mb-4">
                <FaShieldAlt className="text-[#7C3AED] text-base" />
                <h2 className="text-sm font-semibold text-gray-900">Security</h2>
              </div>
              <div className="space-y-3">
                <ToggleSwitch
                  enabled={settings.twoFactor}
                  onChange={() => handleToggle('twoFactor')}
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                />
                <div className="pt-3 border-t border-gray-100">
                  <button className="text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
                    Change Password
                  </button>
                </div>
                <div>
                  <button className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2.5 mb-4">
                <FaGlobe className="text-[#7C3AED] text-base" />
                <h2 className="text-sm font-semibold text-gray-900">Preferences</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Language</label>
                  <select className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Timezone</label>
                  <select className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors">
                    <option value="UTC-12">UTC-12</option>
                    <option value="UTC-11">UTC-11</option>
                    <option value="UTC-10">UTC-10</option>
                    <option value="UTC-9">UTC-9</option>
                    <option value="UTC-8">UTC-8</option>
                    <option value="UTC-7">UTC-7</option>
                    <option value="UTC-6">UTC-6</option>
                    <option value="UTC-5">UTC-5</option>
                    <option value="UTC-4">UTC-4</option>
                    <option value="UTC-3">UTC-3</option>
                    <option value="UTC-2">UTC-2</option>
                    <option value="UTC-1">UTC-1</option>
                    <option value="UTC+0">UTC+0</option>
                    <option value="UTC+1">UTC+1</option>
                    <option value="UTC+2">UTC+2</option>
                    <option value="UTC+3">UTC+3</option>
                    <option value="UTC+4">UTC+4</option>
                    <option value="UTC+5">UTC+5</option>
                    <option value="UTC+5:30" selected>UTC+5:30</option>
                    <option value="UTC+6">UTC+6</option>
                    <option value="UTC+7">UTC+7</option>
                    <option value="UTC+8">UTC+8</option>
                    <option value="UTC+9">UTC+9</option>
                    <option value="UTC+10">UTC+10</option>
                    <option value="UTC+11">UTC+11</option>
                    <option value="UTC+12">UTC+12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Date Format</label>
                  <select className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY" selected>DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Email Preferences Tab */}
          {activeTab === 'email' && (
            <EmailSettings />
          )}

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-4 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded text-xs transition-colors"
            >
              {savedMessage ? (
                <>
                  <FaCheckCircle className="w-3 h-3" />
                  Settings Saved!
                </>
              ) : (
                <>
                  <FaSave className="w-3 h-3" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;