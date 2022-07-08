import { CssBaseline, ThemeProvider } from "@mui/material";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import { lightTheme, darkTheme } from "../themes";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 0,
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
      }}
    >
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </SWRConfig>
  );
}

export default MyApp;
