import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { DatesScreen } from '../screens/dates/DatesScreen';
import { WidgetsScreen } from '../screens/widgets/WidgetsScreen';
import { WallpapersScreen } from '../screens/wallpapers/WallpapersScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ThemeScreen } from '../screens/theme/ThemeScreen';
import { useTheme } from '../hooks/useTheme';
import { useDates } from '../context/DateStoreContext';
import { useOverlay } from '../hooks/useOverlay';
import { useWeather } from '../hooks/useWeather';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { colors, variant } = useTheme();
  const { dates } = useDates();
  const { weather } = useWeather();
  const overlay = useOverlay();

  const weatherStr = `WEATHER ${weather.temp}°C (${weather.location})`;

  // Sync data globally whenever theme, dates, or weather change
  React.useEffect(() => {
    overlay.syncData(variant, colors, dates, weatherStr);
  }, [variant, colors, dates, weatherStr, overlay.syncData]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Theme" component={ThemeScreen} />
      <Stack.Screen name="Dates" component={DatesScreen} />
      <Stack.Screen name="Widgets" component={WidgetsScreen} />
      <Stack.Screen name="Wallpapers" component={WallpapersScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
