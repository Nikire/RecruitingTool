import { alpha, createTheme, ThemeOptions } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

/**
 * Shared typography and component overrides used by both light and dark themes.
 * Extracted from palette.ts to keep theme configuration DRY.
 */
const sharedThemeOptions: Omit<ThemeOptions, "palette"> = {
  typography: {
    fontFamily: [
      '"Clash Grotesk"',
      "Roboto",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),

    fontSize: 16,

    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,

    h1: {
      fontSize: "3.5rem",
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: "-0.02em",
      fontFamily: '"Clash Grotesk", Roboto, sans-serif',
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.015em",
      fontFamily: '"Clash Grotesk", Roboto, sans-serif',
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: "-0.01em",
      fontFamily: '"Clash Grotesk", Roboto, sans-serif',
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.005em",
      fontFamily: '"Clash Grotesk", Roboto, sans-serif',
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0em",
      fontFamily: '"Clash Grotesk", Roboto, sans-serif',
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0.005em",
      fontFamily: '"Clash Grotesk", Roboto, sans-serif',
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0.0075em",
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: "0.01em",
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0.00938em",
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: "0.01071em",
    },
    button: {
      fontSize: "0.9375rem",
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: "0.02857em",
      textTransform: "none",
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: "0.03333em",
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 2.66,
      letterSpacing: "0.08333em",
      textTransform: "uppercase",
    },
  },
  components: {
    ...({
      MuiTimelineConnector: {
        styleOverrides: {
          root: {
            backgroundColor: "#325CE7",
          },
        },
      },
    } as Record<string, unknown>),
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: "h1",
          h2: "h2",
          h3: "h3",
          h4: "h4",
          h5: "h5",
          h6: "h6",
          subtitle1: "p",
          subtitle2: "p",
          body1: "p",
          body2: "p",
        },
      },
    },
  },
};

/**
 * Light theme — the default Borderless palette.
 * Colors match the Borderless brand identity.
 */
const lightThemeOptions: ThemeOptions = {
  ...sharedThemeOptions,
  palette: {
    mode: "light",
    primary: {
      main: "#325CE7",
      light: "#B6C5F6",
    },
    background: {
      default: "#DEE7E7",
      paper: "#ffffff",
    },
    action: {
      disabled: grey[400],
      disabledOpacity: 1,
      disabledBackground: grey.A200,
    },
  },
  components: {
    ...sharedThemeOptions.components,
    MuiAccordion: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha("#B6C5F6", 0.3),
          "&.Mui-disabled .MuiTypography-root": {
            color: theme.palette.text.disabled,
          },
        }),
        rounded: {
          borderRadius: "20px !important",
        },
      },
    },
  },
};

/**
 * Dark theme — professional dark palette with blue accent colors.
 * Maintains the Borderless brand identity with appropriate dark surfaces.
 */
const darkThemeOptions: ThemeOptions = {
  ...sharedThemeOptions,
  palette: {
    mode: "dark",
    primary: {
      main: "#325CE7",
      light: "#B6C5F6",
    },
    secondary: {
      main: "#1e2a38",
      light: "#2d3e52",
      dark: "#141d28",
      contrastText: "#ffffff",
    },
    background: {
      default: "#0f1923",
      paper: "#1a2535",
    },
    action: {
      disabled: grey[600],
      disabledOpacity: 1,
      disabledBackground: grey[800],
    },
  },
  components: {
    ...sharedThemeOptions.components,
    MuiAccordion: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          "&.Mui-disabled .MuiTypography-root": {
            color: theme.palette.text.disabled,
          },
        }),
        rounded: {
          borderRadius: "20px !important",
        },
      },
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
