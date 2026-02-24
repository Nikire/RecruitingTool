import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "flag-icons/css/flag-icons.min.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { Provider as JotaiProvider, useAtomValue } from "jotai";

import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/error/ErrorBoundary.tsx";
import Auth0ProviderWithNavigate from "./providers/Auth0ProviderWithNavigate.tsx";
import { lightTheme, darkTheme } from "./theme/index.ts";
import { themeModeAtom } from "./store/preferences.atoms.ts";

import "./i18n/i18n.ts";

/**
 * React Query Client Configuration
 *
 * Default options for all queries and mutations in the application.
 * These settings provide optimal performance and user experience.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed queries once before giving up
      retry: 1,

      // Don't refetch on window focus to reduce unnecessary API calls
      refetchOnWindowFocus: false,

      // Consider data stale after 5 minutes
      staleTime: 5 * 60 * 1000,

      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,

      // Global error handler for queries
      // Individual queries can override this with their own onError
      throwOnError: false,
    },
    mutations: {
      // Global error handler for mutations
      // Individual mutations should handle errors with onError
      throwOnError: false,
    },
  },
});

/**
 * ThemeWrapper - reads the persisted theme mode atom and applies the correct
 * MUI + Styled Components theme. Must live inside JotaiProvider so it can
 * access the atom.
 */
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const themeMode = useAtomValue(themeModeAtom);
  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </MuiThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <ThemeWrapper>
            <BrowserRouter>
              <Auth0ProviderWithNavigate>
                <App />
              </Auth0ProviderWithNavigate>
            </BrowserRouter>
          </ThemeWrapper>
        </JotaiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
