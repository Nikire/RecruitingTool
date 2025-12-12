import { Auth0Provider, Auth0ProviderOptions } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { PropsWithChildren } from "react";

/**
 * Auth0 Provider Wrapper
 *
 * Wraps the application with Auth0Provider if Auth0 is configured via environment variables.
 * If Auth0 is not configured, the provider is skipped and children are rendered directly.
 *
 * This makes Auth0 optional - social login buttons will be hidden if Auth0 is not configured.
 *
 * Required environment variables:
 * - VITE_AUTH0_DOMAIN: Your Auth0 tenant domain (e.g., 'your-tenant.auth0.com')
 * - VITE_AUTH0_CLIENT_ID: Your Auth0 application client ID
 * - VITE_AUTH0_AUDIENCE: Your API audience identifier (optional)
 */
const Auth0ProviderWithNavigate = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // If Auth0 is not configured, render children without Auth0Provider
  if (!domain || !clientId) {
    return <>{children}</>;
  }

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  const providerConfig: Auth0ProviderOptions = {
    domain,
    clientId,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(audience && { audience }), // Only include audience if provided
    },
    onRedirectCallback,
    useRefreshTokens: true,
    cacheLocation: "localstorage",
  };

  return <Auth0Provider {...providerConfig}>{children}</Auth0Provider>;
};

export default Auth0ProviderWithNavigate;

/**
 * Helper hook to check if Auth0 is configured
 * Can be used to conditionally show/hide social login buttons
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth0Configured = (): boolean => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  return !!(domain && clientId);
};
