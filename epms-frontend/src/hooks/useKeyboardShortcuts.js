// src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { openSearch } from '../store/slices/searchSlice';

export const useKeyboardShortcuts = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(openSearch());
      }

      // Escape to close modals (handled in individual components)
      // Cmd+N for new task (optional)
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        // You can dispatch an action to open task creation modal
        // dispatch(openTaskCreation());
      }

      // Cmd+Shift+P for projects (optional)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        // Navigate to projects page
        // navigate('/projects');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  return null;
};

export default useKeyboardShortcuts;