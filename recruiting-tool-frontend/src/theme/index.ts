import type { CSSProperties } from "react";
import { alpha, createTheme, ThemeOptions } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

export * from "./statusPalette";

/**
 * DESIGN TOKENS
 *
 * FONT WEIGHTS - only 300 / 400 / 500 / 700 are loaded (see `src/main.tsx`).
 * Anything else in an `sx` prop cannot render: the CSS font-matching algorithm
 * silently snaps 600, 800 and 900 up to the nearest available face (700), so
 * "extrabold" and "black" text is already indistinguishable from bold. Do NOT
 * add faces to fix this - each extra weight is another woff2 download on the
 * landing page. Use 400 / 500 / 700 and nothing else.
 *
 * RADIUS - `shape.borderRadius` is pinned at MUI's default of 4px because every
 * `sx={{ borderRadius: n }}` in the app is a MULTIPLIER of it
 * (`borderRadius: 2` === 8px). Changing this number rescales ~200 call sites at
 * once. To change the house radius, change the component defaults below.
 *
 * SPACING - pinned at MUI's default of 8px for the same reason (`p: 2` === 16px).
 */
const BORDER_RADIUS_BASE = 4;
const SPACING_BASE = 8;

/**
 * THE page-title token. Before this existed, "page title" was three different
 * things: theme `h4` (1.5rem/500), `PageHeader`'s inline override
 * (2.125rem/700, responsive) and `AnalyticsPage`'s `h4 + fontWeight={700}`.
 *
 * `PageHeader` won - it is the de-facto standard across 35 screens - so its
 * definition is what the theme now expresses. `h4` is deliberately left alone:
 * it is a section / dialog / stat-value heading (59 call sites, most of them
 * not page titles) and promoting it to page-title size would resize all of
 * them.
 *
 * Usage: `<Typography variant="pageTitle" component="h1">`
 */
const pageTitle = {
  fontSize: "1.5rem",
  fontWeight: 700,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  fontFamily: "Roboto, sans-serif",
  "@media (min-width:600px)": {
    fontSize: "2.125rem",
  },
} as CSSProperties;

declare module "@mui/material/styles" {
  interface TypographyVariants {
    pageTitle: CSSProperties;
  }
  interface TypographyVariantsOptions {
    pageTitle?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    pageTitle: true;
  }
}

/**
 * Shared typography and component overrides used by both light and dark themes.
 * Extracted from palette.ts to keep theme configuration DRY.
 */
const sharedThemeOptions: Omit<ThemeOptions, "palette"> = {
  shape: {
    borderRadius: BORDER_RADIUS_BASE,
  },
  spacing: SPACING_BASE,
  typography: {
    fontFamily: [
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

    pageTitle,

    h1: {
      fontSize: "3.5rem",
      fontWeight: 500,
      lineHeight: 1.15,
      letterSpacing: "-0.02em",
      fontFamily: "Roboto, sans-serif",
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: "-0.015em",
      fontFamily: "Roboto, sans-serif",
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 500,
      lineHeight: 1.25,
      letterSpacing: "-0.01em",
      fontFamily: "Roboto, sans-serif",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: "-0.005em",
      fontFamily: "Roboto, sans-serif",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: "0em",
      fontFamily: "Roboto, sans-serif",
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: "0.005em",
      fontFamily: "Roboto, sans-serif",
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
    MuiTableCell: {
      styleOverrides: {
        root: {
          verticalAlign: "middle",
        },
      },
    },
    /**
     * House surface radius: 8px (= `shape.borderRadius * 2`), which is what the
     * app already writes by hand more than any other value (~119
     * `borderRadius: 2` call sites). Targets the `rounded` slot rather than
     * `root` so `<Paper square>` and AppBar keep sharp corners. Card, Dialog,
     * Menu, Popover and Autocomplete all render a Paper and inherit this. Any
     * local `sx={{ borderRadius: ... }}` still wins.
     */
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: BORDER_RADIUS_BASE * 2,
        },
      },
    },
    /**
     * Cards default to elevation 2 - the app's dominant convention (40 explicit
     * `elevation={2}` call sites vs. 9 at `1`). MUI's own default is 1, so cards
     * that specify nothing gain one shadow step. Revert by deleting
     * `defaultProps` here.
     */
    MuiCard: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS_BASE * 2,
        },
      },
    },
    /**
     * Project UI rule: chips are always filled, notably inside tables. This is
     * also MUI's own default, so declaring it changes nothing today - it exists
     * so the rule is enforced by the theme rather than by 262 call sites
     * remembering it. An explicit `variant="outlined"` prop still wins.
     */
    MuiChip: {
      defaultProps: {
        variant: "filled",
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: "h1",
          h2: "h2",
          h3: "h3",
          h4: "h4",
          h5: "h5",
          h6: "h6",
          pageTitle: "h1",
          subtitle1: "p",
          subtitle2: "p",
          body1: "p",
          body2: "p",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlinedSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          borderColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.secondary.dark,
            borderColor: theme.palette.secondary.dark,
          },
        }),
        textSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.secondary.dark,
          },
        }),
      },
    },
  },
};

/**
 * Light theme - the default Borderless palette.
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
    /**
     * Light mode had NO secondary, so it silently fell back to MUI's default
     * purple (#9c27b0) - which is what `color="secondary"` buttons and chips
     * have actually been rendering as. Cyan matches the dark theme's own
     * secondary chip override (#0891B2) and sits correctly beside the #325CE7
     * primary.
     */
    secondary: {
      main: "#0891B2",
      light: "#22D3EE",
      dark: "#0E7490",
      contrastText: "#ffffff",
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
 * Dark theme - professional dark palette with blue accent colors.
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
    // Spread the shared MuiChip config so the `variant: "filled"` default is
    // not lost when this block replaces it.
    MuiChip: {
      ...sharedThemeOptions.components?.MuiChip,
      styleOverrides: {
        colorSecondary: {
          backgroundColor: "#0891B2",
          color: "#ffffff",
        },
      },
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
