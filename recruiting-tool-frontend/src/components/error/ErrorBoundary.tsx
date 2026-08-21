import { Component, ErrorInfo, ReactNode } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import * as Sentry from "@sentry/react";
import { isSentryEnabled } from "../../analytics";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Global Error Boundary Component
 *
 * Catches unhandled React errors and displays a user-friendly error UI.
 * Shows error details in development mode, hides them in production.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console in development
    if (import.meta.env.MODE === "development") {
      console.error("ErrorBoundary caught error:", error);
      console.error("Error info:", errorInfo);
    }

    // Update state with error information
    this.setState({
      error,
      errorInfo,
    });

    // Report to Sentry. No-ops when VITE_SENTRY_DSN is absent, so a developer
    // without a Sentry account runs the app unchanged and offline.
    if (isSentryEnabled()) {
      try {
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });
      } catch {
        // Error reporting must never mask the original error or break the
        // fallback UI - the user still sees the recovery screen either way.
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary UI Component
 *
 * Displays user-friendly error message with recovery options.
 * Shows stack trace only in development mode.
 */
interface ErrorBoundaryUIProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onReload: () => void;
  onGoHome: () => void;
}

const ErrorBoundaryUI = ({
  error,
  errorInfo,
  onReload,
  onGoHome,
}: ErrorBoundaryUIProps) => {
  const { t } = useTranslation();
  const isDevelopment = import.meta.env.MODE === "development";

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            maxWidth: "700px",
            width: "100%",
            borderTop: 4,
            borderColor: "error.main",
          }}
        >
          {/* Error Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: "error.main",
              }}
            />
          </Box>

          {/* Error Title */}
          <Typography variant="h4" gutterBottom color="error">
            {t("errors.boundary.title")}
          </Typography>

          {/* Error Message */}
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ mb: 4 }}
          >
            {t("errors.boundary.message")}
          </Typography>

          {/* Recovery Actions */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
              mb: 4,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onReload}
              size="large"
            >
              {t("errors.boundary.reload")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={onGoHome}
              size="large"
            >
              {t("errors.boundary.home")}
            </Button>
          </Box>

          {/* Error Details (Development Only) - Collapsible Accordion */}
          {isDevelopment && error && (
            <Box sx={{ mt: 4, textAlign: "left" }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="error-details-content"
                  id="error-details-header"
                >
                  <Typography color="error" variant="subtitle1">
                    {t("errors.boundary.details")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Error Message */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Error:
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "grey.100",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        overflow: "auto",
                      }}
                    >
                      <Typography variant="body2" component="pre">
                        {error.toString()}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Component Stack */}
                  {errorInfo?.componentStack && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {t("errors.boundary.component_stack")}:
                      </Typography>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: "grey.100",
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          overflow: "auto",
                          maxHeight: 300,
                        }}
                      >
                        <Typography variant="body2" component="pre">
                          {errorInfo.componentStack}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}

          {/* Support Message */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            {t("errors.boundary.support_message")}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorBoundary;
