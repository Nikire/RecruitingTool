import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { socialCallback } from "../../api/auth";
import { useUserAtom } from "../../store";
import { useAuth0Configured } from "../../providers/Auth0ProviderWithNavigate";
import { getDefaultDashboard } from "../../utils/permissions";

/**
 * Auth0CallbackHandler
 *
 * Runs on every page render. When Auth0 reports isAuthenticated=true but
 * no local JWT is present in localStorage, it exchanges the Auth0 access
 * token for a backend JWT by calling POST /api/auth/social/callback.
 *
 * Uses a ref to guard against double-execution in React StrictMode.
 */
const Auth0CallbackHandler: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, getIdTokenClaims } = useAuth0();
  const { setUser } = useUserAtom();
  const navigate = useNavigate();
  const isAuth0Configured = useAuth0Configured();

  const [error, setError] = useState<string | null>(null);

  // Guard against double-invocation in React StrictMode
  const handledRef = useRef(false);

  useEffect(() => {
    // Only run if Auth0 is configured, not loading, and the user is Auth0-authenticated
    if (!isAuth0Configured || isLoading || !isAuthenticated) {
      return;
    }

    // If a local token already exists, Auth0 session is already synced
    const existingToken = localStorage.getItem("authToken");
    if (existingToken) {
      return;
    }

    // Only proceed if the user explicitly initiated a social login from this app.
    // This prevents the handler from firing on every page load when Auth0 has a
    // cached session but no local JWT (e.g. after a failed or incomplete exchange).
    const loginPending = sessionStorage.getItem("auth0_login_pending");
    if (!loginPending) {
      return;
    }

    // Prevent double-execution (React StrictMode mounts effects twice)
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const exchangeToken = async () => {
      setError(null);

      try {
        const idTokenClaims = await getIdTokenClaims();
        const idToken = idTokenClaims?.__raw;

        if (!idToken) {
          throw new Error('Could not retrieve ID token');
        }

        const data = await socialCallback(idToken);

        // Clear the pending flag — exchange completed successfully
        sessionStorage.removeItem("auth0_login_pending");

        // Store local JWT tokens
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Populate Jotai user atom
        setUser(data.user);

        // Navigate to the appropriate dashboard
        const destination = getDefaultDashboard(data.user);
        navigate(destination, { replace: true });
      } catch (err) {
        console.error("[Auth0CallbackHandler] Token exchange failed:", err);
        // Clear the pending flag so we don't retry on every render
        sessionStorage.removeItem("auth0_login_pending");
        setError(t("auth.social.callback_error"));
        // Reset guard so user can retry if they re-authenticate
        handledRef.current = false;
      }
    };

    exchangeToken();
  }, [
    isAuth0Configured,
    isAuthenticated,
    isLoading,
    getIdTokenClaims,
    navigate,
    setUser,
    t,
  ]);

  // Show a brief error state — user can navigate away
  if (error) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          bgcolor: "background.default",
        }}
      >
        <Typography variant="body1" color="error">
          {error}
        </Typography>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => navigate("/login", { replace: true })}
        >
          {t("auth.sign_in_link")}
        </Typography>
      </Box>
    );
  }

  // No visual output in the normal (already-authenticated) case
  return null;
};

export default Auth0CallbackHandler;
