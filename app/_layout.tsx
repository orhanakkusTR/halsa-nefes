import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { initNotifications } from '@/lib/notifications';
import { hydrateStore, useAppStore } from '@/store/appStore';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Web preview only: browsers (especially with macOS "always show scroll bars")
// paint scrollbars on every scrollable area — the sound carousel, content
// scrolls etc. A native app never shows these; hide them wholesale on web.
function useHideWebScrollbars() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      * { scrollbar-width: none; -ms-overflow-style: none; overflow-anchor: none; }
      *::-webkit-scrollbar { display: none; width: 0; height: 0; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

// İlk açılışta (onboardingDone=false) tüm rotalar tanıtıma yönlenir.
// Hidrasyon beklenir; böylece ana ekran bir an bile parlamaz.
function OnboardingGate() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !onboardingDone && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [hydrated, onboardingDone, pathname, router]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const hydrated = useAppStore((s) => s.hydrated);

  useHideWebScrollbars();

  useEffect(() => {
    hydrateStore();
    initNotifications();
  }, []);

  useEffect(() => {
    if (fontsLoaded && hydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <OnboardingGate />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </>
  );
}
