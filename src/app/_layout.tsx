import { DarkTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { TransactionProvider } from "@/context/TransactionContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <TransactionProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </TransactionProvider>
    </ThemeProvider>
  );
}
