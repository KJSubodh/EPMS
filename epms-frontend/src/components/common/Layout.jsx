// src/components/common/Layout.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SearchModal from '../search/SearchModal';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // ✅ Use the keyboard shortcuts hook
  useKeyboardShortcuts();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
      
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-0'}`}>
        <main className="pt-20 px-4 md:px-6 pb-8 min-h-[calc(100vh-5rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ✅ Global Search Modal */}
      <SearchModal />
    </div>
  );
};

export default Layout;