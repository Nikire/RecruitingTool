import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * StatusIndicator - Visual status indicator with icon, dot, and label
 *
 * @description Displays service/system status with color-coded visual indicators
 * Supports three status types: ok (green), error (red), warning (yellow)
 */

export type StatusType = 'ok' | 'error' | 'warning';

export interface StatusIndicatorProps {
  /** Current status type */
  status: StatusType;
  /** Label text (i18n key or plain text) */
  label: string;
  /** Whether to translate the label (default: true) */
  translate?: boolean;
  /** Show icon alongside dot (default: true) */
  showIcon?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  translate = true,
  showIcon = true,
  size = 'medium',
}) => {
  const { t } = useTranslation();

  const statusConfig = {
    ok: {
      color: 'success.main',
      icon: <CheckCircleIcon fontSize={size} />,
    },
    error: {
      color: 'error.main',
      icon: <ErrorIcon fontSize={size} />,
    },
    warning: {
      color: 'warning.main',
      icon: <WarningIcon fontSize={size} />,
    },
  };

  const config = statusConfig[status];
  const displayLabel = translate ? t(label) : label;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {showIcon && (
        <Box sx={{ color: config.color, display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </Box>
      )}
      <Box
        sx={{
          width: size === 'small' ? 8 : 10,
          height: size === 'small' ? 8 : 10,
          borderRadius: '50%',
          bgcolor: config.color,
        }}
      />
      <Typography
        variant={size === 'small' ? 'body2' : 'body1'}
        color="text.primary"
      >
        {displayLabel}
      </Typography>
    </Box>
  );
};

export default StatusIndicator;
