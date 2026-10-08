import { I18nManager, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import {
  useFonts,
  NotoNastaliqUrdu_400Regular,
  NotoNastaliqUrdu_500Medium,
  NotoNastaliqUrdu_600SemiBold,
  NotoNastaliqUrdu_700Bold,
} from '@expo-google-fonts/noto-nastaliq-urdu';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import * as Updates from 'expo-updates';

// Force RTL on first launch and reload if layout direction was LTR
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  if (Platform.OS !== 'web') {
    try {
      Updates.reloadAsync();
    } catch (e) {
      // Ignored in dev / unsupported environments
    }
  }
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoNastaliqUrdu_400Regular,
    NotoNastaliqUrdu_500Medium,
    NotoNastaliqUrdu_600SemiBold,
    NotoNastaliqUrdu_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
