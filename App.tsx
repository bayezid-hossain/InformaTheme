import './global.css';
import './src/services/backgroundTask';
import React, { useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  SirinStencil_400Regular,
} from '@expo-google-fonts/sirin-stencil';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import { ThemeContext } from './src/hooks/useTheme';
import { useThemeProvider } from './src/hooks/useThemeProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { AlertProvider } from './src/hooks/useAlert';
import { DateStoreProvider } from './src/context/DateStoreContext';
import { usePermissions } from './src/hooks/usePermissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AppContent() {
  const themeValue = useThemeProvider();
  const { colors } = themeValue;
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const perms = usePermissions();

  React.useEffect(() => {
    AsyncStorage.getItem('onboarded').then((v) => setOnboarded(v === 'true'));
  }, []);

  function finishOnboarding() {
    AsyncStorage.setItem('onboarded', 'true');
    setOnboarded(true);
  }

  if (onboarded === null || perms.loading) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const missingPermissions = !perms.overlay || !perms.fullScreenIntent;

  return (
    <ThemeContext.Provider value={themeValue}>
      <DateStoreProvider>
        <AlertProvider>
          <StatusBar hidden />
          {!onboarded ? (
            <OnboardingScreen onDone={finishOnboarding} />
          ) : missingPermissions ? (
            <OnboardingScreen onDone={() => perms.check()} initialStep={3} />
          ) : (
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          )}
        </AlertProvider>
      </DateStoreProvider>
    </ThemeContext.Provider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SirinStencil_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {fontsLoaded && <AppContent />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
