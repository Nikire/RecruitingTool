import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "flag-icons/css/flag-icons.min.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { Provider as JotaiProvider } from "jotai";

import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import recruitingToolPalette from "./palette.ts";
import ErrorBoundary from "./components/error/ErrorBoundary.tsx";
import Auth0ProviderWithNavigate from "./providers/Auth0ProviderWithNavigate.tsx";

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

const theme = createTheme(recruitingToolPalette);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MuiThemeProvider theme={theme}>
          <StyledThemeProvider theme={theme}>
            <JotaiProvider>
              <BrowserRouter>
                <Auth0ProviderWithNavigate>
                  <App />
                </Auth0ProviderWithNavigate>
              </BrowserRouter>
            </JotaiProvider>
          </StyledThemeProvider>
        </MuiThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
