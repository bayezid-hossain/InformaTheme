import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { DatesScreen } from '../screens/dates/DatesScreen';
import { WidgetsScreen } from '../screens/widgets/WidgetsScreen';
import { WallpapersScreen } from '../screens/wallpapers/WallpapersScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { useTheme } from '../hooks/useTheme';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Dates" component={DatesScreen} />
      <Stack.Screen name="Widgets" component={WidgetsScreen} />
      <Stack.Screen name="Wallpapers" component={WallpapersScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
