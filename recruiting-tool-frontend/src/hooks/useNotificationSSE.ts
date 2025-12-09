import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NOTIFICATIONS_QUERY_KEY, UNREAD_COUNT_QUERY_KEY } from './useNotifications';
import { Notification } from '../types/notification';

interface SSEEvent {
  type: string;
  payload: any;
  timestamp: string;
  userUid?: string;
  companyUid?: string;
}

/**
 * Hook to establish SSE connection for real-time notifications
 * Automatically updates React Query cache when new notifications arrive
 */
export function useNotificationSSE() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    const MAX_RECONNECT_ATTEMPTS = 5;
    const INITIAL_RECONNECT_DELAY = 1000; // 1 second
    const MAX_RECONNECT_DELAY = 30000; // 30 seconds

    const connectSSE = () => {
      try {
        // Get auth token
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('[SSE] No auth token found, skipping SSE connection');
          return;
        }

        // Create EventSource URL with auth token as query parameter
        // EventSource doesn't support headers, so we pass token as query param
        const baseUrl = import.meta.env.VITE_API_URL;
        const sseUrl = `${baseUrl}/sse/events?token=${token}`;

        console.log('[SSE] Connecting to notification stream...');
        const eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;

        // Connection established
        eventSource.addEventListener('CONNECTION_ESTABLISHED', (event) => {
          console.log('[SSE] Connection established:', event.data);
          reconnectAttemptsRef.current = 0; // Reset reconnect attempts on success
        });

        // Heartbeat to keep connection alive
        eventSource.addEventListener('HEARTBEAT', () => {
          // Silent heartbeat - just keeps connection alive
        });

        // New notification event
        eventSource.addEventListener('NOTIFICATION', (event) => {
          try {
            const data: SSEEvent = JSON.parse(event.data);
            console.log('[SSE] New notification received:', data);

            // Invalidate queries to fetch fresh data
            queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });

            // Optional: Optimistically add to cache for instant update
            // (Currently using invalidation for simplicity and consistency)
          } catch (error) {
            console.error('[SSE] Failed to parse notification event:', error);
          }
        });

        // Connection opened
        eventSource.onopen = () => {
          console.log('[SSE] Connection opened');
          reconnectAttemptsRef.current = 0;
        };

        // Error handler
        eventSource.onerror = (error) => {
          console.error('[SSE] Connection error:', error);
          eventSource.close();

          // Attempt to reconnect with exponential backoff
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(
              INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
              MAX_RECONNECT_DELAY
            );

            console.log(
              `[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})...`
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connectSSE();
            }, delay);
          } else {
            console.error('[SSE] Max reconnection attempts reached. Giving up.');
          }
        };
      } catch (error) {
        console.error('[SSE] Failed to create EventSource:', error);
      }
    };

    // Connect on mount
    connectSSE();

    // Cleanup on unmount
    return () => {
      console.log('[SSE] Cleaning up SSE connection...');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [queryClient]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  };
}
