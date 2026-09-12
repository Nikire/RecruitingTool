import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_COUNT_QUERY_KEY,
} from "./useNotifications";

interface SSEEvent {
  type: string;
  payload: unknown;
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
  // Real state, not a ref read during render: a ref never re-renders, so the
  // previous `eventSourceRef.current?.readyState` expression could not drive
  // any UI indicator.
  const [isConnected, setIsConnected] = useState(false);
  // Lets the visibility/online listeners below restart a stream that already
  // exhausted its retries, without re-running the whole connection effect.
  const reconnectNowRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const MAX_RECONNECT_ATTEMPTS = 5;
    const INITIAL_RECONNECT_DELAY = 1000; // 1 second
    const MAX_RECONNECT_DELAY = 30000; // 30 seconds

    const connectSSE = () => {
      try {
        // Get auth token
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.warn("[SSE] No auth token found, skipping SSE connection");
          return;
        }

        // Create EventSource URL with auth token as query parameter
        // EventSource doesn't support headers, so we pass token as query param
        const baseUrl = import.meta.env.VITE_API_URL;
        const sseUrl = `${baseUrl}/sse/events?token=${token}`;

        console.log("[SSE] Connecting to notification stream...");
        const eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;
        setIsConnected(false);

        // Connection established
        eventSource.addEventListener("CONNECTION_ESTABLISHED", (event) => {
          console.log("[SSE] Connection established:", event.data);
          reconnectAttemptsRef.current = 0; // Reset reconnect attempts on success
          setIsConnected(true);
        });

        // Heartbeat to keep connection alive
        eventSource.addEventListener("HEARTBEAT", () => {
          // Silent heartbeat - just keeps connection alive
        });

        // New notification event
        eventSource.addEventListener("NOTIFICATION", (event) => {
          try {
            const data: SSEEvent = JSON.parse(event.data);
            console.log("[SSE] New notification received:", data);

            // Invalidate queries to fetch fresh data
            queryClient.invalidateQueries({
              queryKey: [NOTIFICATIONS_QUERY_KEY],
            });
            queryClient.invalidateQueries({
              queryKey: [UNREAD_COUNT_QUERY_KEY],
            });

            // Optional: Optimistically add to cache for instant update
            // (Currently using invalidation for simplicity and consistency)
          } catch (error) {
            console.error("[SSE] Failed to parse notification event:", error);
          }
        });

        // Connection opened
        eventSource.onopen = () => {
          console.log("[SSE] Connection opened");
          reconnectAttemptsRef.current = 0;
          setIsConnected(true);
        };

        // Error handler
        eventSource.onerror = (error) => {
          console.error("[SSE] Connection error:", error);
          eventSource.close();
          setIsConnected(false);

          // Attempt to reconnect with exponential backoff
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(
              INITIAL_RECONNECT_DELAY *
                Math.pow(2, reconnectAttemptsRef.current),
              MAX_RECONNECT_DELAY,
            );

            console.log(
              `[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})...`,
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connectSSE();
            }, delay);
          } else {
            console.error(
              "[SSE] Max reconnection attempts reached. Giving up.",
            );
          }
        };
      } catch (error) {
        console.error("[SSE] Failed to create EventSource:", error);
      }
    };

    // Connect on mount
    connectSSE();

    // Five retries span only ~31s, after which the stream used to stay dead
    // until a full page reload — a backend deploy, a laptop waking from sleep
    // or a brief network drop killed real-time notifications for the rest of
    // the session. Coming back to the tab (or back online) resets the budget
    // and reconnects.
    const retryFromScratch = () => {
      const readyState = eventSourceRef.current?.readyState;
      if (
        readyState === EventSource.OPEN ||
        readyState === EventSource.CONNECTING
      ) {
        return;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      reconnectAttemptsRef.current = 0;
      connectSSE();
    };

    reconnectNowRef.current = retryFromScratch;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        retryFromScratch();
      }
    };

    window.addEventListener("online", retryFromScratch);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      console.log("[SSE] Cleaning up SSE connection...");
      window.removeEventListener("online", retryFromScratch);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reconnectNowRef.current = null;
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

  /** Force an immediate reconnect, resetting the retry budget. */
  const reconnect = useCallback(() => {
    reconnectNowRef.current?.();
  }, []);

  return {
    isConnected,
    reconnect,
  };
}
