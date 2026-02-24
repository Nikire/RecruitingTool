import React from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { useAtomValue } from "jotai";
import { lightTheme, darkTheme } from "../theme/index.ts";
import { themeModeAtom } from "../store/preferences.atoms.ts";

/**
 * ThemeWrapper - reads the persisted theme mode atom and applies the correct
 * MUI + Styled Components theme. Must live inside JotaiProvider so it can
 * access the atom.
 *
 * CssBaseline applies theme.palette.background.default to <body> so the
 * background colour updates correctly when switching between light and dark mode.
 */
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const themeMode = useAtomValue(themeModeAtom);
  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default ThemeWrapper;
