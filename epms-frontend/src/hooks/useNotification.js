// src/hooks/useNotifications.js
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification, fetchUnreadCount } from '../store/slices/notificationSlice';
import { toast } from 'react-toastify';

export const useNotifications = (userId) => {
  const dispatch = useDispatch();
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Set up SSE connection for real-time notifications
    const setupSSE = () => {
      try {
        // Using Server-Sent Events (SSE) - simpler than WebSocket
        const eventSource = new EventSource(`/api/notifications/stream?userId=${userId}`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            dispatch(addNotification(notification));
            
            // Show toast for new notification
            toast.info(notification.message, {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            
            // Update unread count
            dispatch(fetchUnreadCount());
          } catch (error) {
            console.error('Error processing notification:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              setupSSE();
            }
          }, 5000);
        };

        return eventSource;
      } catch (error) {
        console.error('Failed to setup SSE:', error);
        return null;
      }
    };

    const eventSource = setupSSE();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [dispatch, userId]);

  // Fallback: Polling for browsers that don't support SSE
  useEffect(() => {
    if (!userId) return;

    // Poll every 30 seconds as fallback
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, userId]);
};