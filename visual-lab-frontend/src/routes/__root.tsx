import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { LocaleProvider, useLocale } from "../context/locale";
import Header from "../components/layouts/Header";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <LocaleProvider>
          <Header />
          <Outlet />
          <TanStackRouterDevtools position="bottom-right" />
        </LocaleProvider>
      </ThemeProvider>
    </>
  );
}
