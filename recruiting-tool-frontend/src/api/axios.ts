import axios from "axios";
import {
  enhancedResponseNormalizer,
  errorNormalizerInterceptor,
} from "./responseNormalizer";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// JWT token validation helper (for access tokens)
function isValidJwtToken(token: string | null): boolean {
  if (!token) return false;
  if (typeof token !== "string") return false;
  if (token === "null" || token === "undefined" || token === "") return false;
  // Basic JWT format check: should have 3 parts separated by dots
  const parts = token.split(".");
  return parts.length === 3;
}

// Refresh token validation helper (refresh tokens are hex strings, not JWTs)
function isValidRefreshToken(token: string | null): boolean {
  if (!token) return false;
  if (typeof token !== "string") return false;
  if (token === "null" || token === "undefined" || token === "") return false;
  // Refresh tokens are 128-char hex strings from crypto.randomBytes(64)
  return token.length >= 32;
}

/**
 * Route prefixes that live behind `<ProtectedRoute>` / `<RoleGuard>` in App.tsx.
 *
 * An expired session is only worth a hard redirect to `/login` when the visitor
 * is on one of these. Everywhere else (landing, careers, blog, legal pages,
 * public booking links, ...) the page renders fine anonymously, and bouncing a
 * returning visitor with a stale token off the landing page to the login form
 * is exactly the wrong behaviour. Denylist rather than allowlist so a new
 * public route can never regress this by being forgotten here.
 */
const PROTECTED_ROUTE_PREFIXES = [
  "/hr",
  "/admin",
  "/profile",
  "/settings",
  "/notifications",
  "/onboarding",
  "/applicant",
  "/invitations",
  "/pending-email-verification",
];

export function isProtectedRoute(
  currentPath: string = window.location.pathname,
): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`),
  );
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - adds JWT token to requests
api.interceptors.request.use((config) => {
  // The hiring-process public tracking endpoint is semi-public:
  // it still accepts an auth token (for email-match bypass) but won't require it.
  const isHiringProcessPublic = config.url?.match(
    /\/hiring-process\/[^/]+\/public$/,
  );

  // Fully public endpoints — skip auth header entirely
  const isFullyPublicEndpoint =
    !isHiringProcessPublic &&
    (config.url?.includes("/public/") ||
      config.url?.includes("-public") ||
      config.url?.startsWith("/unsubscribe/"));

  if (isFullyPublicEndpoint) {
    return config;
  }

  const token = localStorage.getItem("authToken");

  // Validate token before using it
  if (token && !isValidJwtToken(token)) {
    console.warn("[AUTH] Invalid token detected in localStorage, clearing it");
    localStorage.removeItem("authToken");
    return config; // Continue request without token
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - unwraps backend's normalized response structure
// Converts response.data.data → response.data automatically
api.interceptors.response.use(enhancedResponseNormalizer, async (error) => {
  const originalRequest = error.config;

  // Don't redirect to login for public endpoint failures
  const isPublicEndpoint =
    originalRequest?.url?.includes("/public/") ||
    originalRequest?.url?.includes("-public") ||
    originalRequest?.url?.match(/\/hiring-process\/[^/]+\/public$/) ||
    originalRequest?.url?.startsWith("/unsubscribe/");
  if (isPublicEndpoint) {
    // `errorNormalizerInterceptor` already returns a rejected promise. Wrapping
    // it in another `Promise.reject` rejected with the *promise* as the reason,
    // so React Query saw `[object Promise]` and the inner rejection surfaced
    // to Sentry as an unhandled AxiosError.
    return errorNormalizerInterceptor(error);
  }

  // If error is 401 and we haven't tried to refresh yet
  if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refreshToken");

    // Validate refresh token before using it
    if (!refreshToken || !isValidRefreshToken(refreshToken)) {
      // Invalid or missing refresh token, clear auth state
      console.warn(
        "[AUTH] Invalid or missing refresh token, clearing auth state",
      );
      isRefreshing = false;
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      // Only redirect to login when the visitor is on a protected page
      if (isProtectedRoute()) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh the token
      // Note: We use raw axios here instead of 'api' to avoid circular dependency
      // and because we can't use the Authorization header during token refresh
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      // Response normalizer doesn't apply to raw axios calls
      // Backend returns: { data: { accessToken, refreshToken }, success, statusCode }
      // So we need to unwrap manually here
      const responseData = response.data.data || response.data;
      const { accessToken, refreshToken: newRefreshToken } = responseData;

      // Validate new tokens before storing
      if (!accessToken || !isValidJwtToken(accessToken)) {
        console.error(
          "[AUTH] Invalid access token received from refresh endpoint",
        );
        throw new Error("Invalid access token received");
      }

      if (!newRefreshToken || !isValidRefreshToken(newRefreshToken)) {
        console.error(
          "[AUTH] Invalid refresh token received from refresh endpoint",
        );
        throw new Error("Invalid refresh token received");
      }

      // Store new tokens
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Update the authorization header
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      // Process queued requests with new token
      processQueue(null, accessToken);
      isRefreshing = false;

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed, clear auth state
      processQueue(refreshError as Error, null);
      isRefreshing = false;

      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      // Only redirect to login when the visitor is on a protected page
      if (isProtectedRoute()) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }

  // Pass through to error normalizer interceptor
  return errorNormalizerInterceptor(error);
});

export default api;
