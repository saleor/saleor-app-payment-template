import "../styles/globals.css";
import "@saleor/macaw-ui/next/style";

import { AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { ThemeProvider } from "@saleor/macaw-ui/next";
import React, { useEffect } from "react";
import { type AppProps } from "next/app";

import { ThemeSynchronizer } from "../modules/ui/theme-synchronizer";
import { NoSSRWrapper } from "../modules/ui/no-ssr-wrapper";

import { appBridgeInstance } from "@/app-bridge-instance";

function NextApp({ Component, pageProps }: AppProps) {
  /**
   * Configure JSS (used by MacawUI) for SSR. If Macaw is not used, can be removed.
   */
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <ThemeProvider>
          <ThemeSynchronizer />
          <RoutePropagator />
          <Component {...pageProps} />
        </ThemeProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default NextApp;
