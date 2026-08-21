"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3aafa9",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1f5e5a",
    },
  },
  typography: {
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
  },
  shape: { borderRadius: 10 },
});

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
