import { useMediaQuery as useMuiMediaQuery, useTheme } from "@mui/material";

/**
 * Custom hook to check if the current viewport is mobile
 * Mobile is defined as screen width < 600px (sm breakpoint)
 *
 * @returns {boolean} true if mobile viewport, false otherwise
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * <Dialog fullScreen={isMobile} maxWidth="md">
 * ```
 */
export const useIsMobile = (): boolean => {
  const theme = useTheme();
  return useMuiMediaQuery(theme.breakpoints.down("sm"));
};

/**
 * Custom hook to check if the current viewport is tablet or smaller
 * Tablet is defined as screen width < 900px (md breakpoint)
 *
 * @returns {boolean} true if tablet or mobile viewport, false otherwise
 */
export const useIsTablet = (): boolean => {
  const theme = useTheme();
  return useMuiMediaQuery(theme.breakpoints.down("md"));
};

/**
 * Custom hook to check if the current viewport is desktop or larger
 * Desktop is defined as screen width >= 900px (md breakpoint)
 *
 * @returns {boolean} true if desktop viewport, false otherwise
 */
export const useIsDesktop = (): boolean => {
  const theme = useTheme();
  return useMuiMediaQuery(theme.breakpoints.up("md"));
};
