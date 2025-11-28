import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';

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
    if (import.meta.env.MODE === 'development') {
      console.error('ErrorBoundary caught error:', error);
      console.error('Error info:', errorInfo);
    }

    // Update state with error information
    this.setState({
      error,
      errorInfo,
    });

    // TODO: In production, send error to logging service (e.g., Sentry, LogRocket)
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryUI
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        onReload={this.handleReload}
        onGoHome={this.handleGoHome}
      />;
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

const ErrorBoundaryUI = ({ error, errorInfo, onReload, onGoHome }: ErrorBoundaryUIProps) => {
  const { t } = useTranslation();
  const isDevelopment = import.meta.env.MODE === 'development';

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            maxWidth: '600px',
            width: '100%',
          }}
        >
          {/* Error Icon */}
          <ErrorOutlineIcon
            sx={{
              fontSize: 80,
              color: 'error.main',
              mb: 2,
            }}
          />

          {/* Error Title */}
          <Typography variant="h4" gutterBottom color="error">
            {t('errors.boundary.title')}
          </Typography>

          {/* Error Message */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('errors.boundary.message')}
          </Typography>

          {/* Error Details (Development Only) */}
          {isDevelopment && error && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                textAlign: 'left',
                backgroundColor: 'grey.100',
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t('errors.boundary.details')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {error.toString()}
              </Typography>
              {errorInfo?.componentStack && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                    {t('errors.boundary.component_stack')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {errorInfo.componentStack}
                  </Typography>
                </>
              )}
            </Paper>
          )}

          {/* Recovery Actions */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onReload}
              size="large"
            >
              {t('errors.boundary.reload')}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={onGoHome}
              size="large"
            >
              {t('errors.boundary.home')}
            </Button>
          </Box>

          {/* Support Message */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            {t('errors.boundary.support_message')}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorBoundary;
