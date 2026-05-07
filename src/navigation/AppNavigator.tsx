import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { DatesScreen } from '../screens/dates/DatesScreen';
import { WidgetsScreen } from '../screens/widgets/WidgetsScreen';
import { WallpapersScreen } from '../screens/wallpapers/WallpapersScreen';
import { WallpaperEditorScreen } from '../screens/wallpapers/WallpaperEditorScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ThemeScreen } from '../screens/theme/ThemeScreen';
import { useTheme } from '../hooks/useTheme';
import { useDates } from '../context/DateStoreContext';
import { useOverlay } from '../hooks/useOverlay';
import { useWeather } from '../hooks/useWeather';
import { useWidgetStore } from '../hooks/useWidgetStore';
import { useFontSettings } from '../hooks/useFontSettings';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { colors, variant, customWallpaper, selectedWallpaper, fontId } = useTheme();
  const { dates } = useDates();
  const { weather } = useWeather();
  const overlay = useOverlay();
  const { widgets } = useWidgetStore();
  const { settings: fontSettings } = useFontSettings();

  const weatherStr = weather.location ? `WEATHER ${weather.temp}°C (${weather.location})` : '';
  const enabledWidgetIdsStr = React.useMemo(() => {
    return widgets.filter(w => w.enabled).map(w => w.id).join(',');
  }, [widgets]);

  React.useEffect(() => {
    const wpOverride = customWallpaper ? customWallpaper.uri : (selectedWallpaper ? selectedWallpaper : undefined);
    const wpFilter = customWallpaper ? customWallpaper.filter : undefined;
    
    // Convert preset ID to wp_... format if it's a selectedWallpaper string
    let finalWp = wpOverride;
    if (wpOverride && !wpOverride.startsWith('file://') && !wpOverride.startsWith('content://') && !wpOverride.startsWith('/')) {
        finalWp = `wp_${wpOverride.replace(/([A-Z])/g, '_$1').toLowerCase()}`;
    }

    overlay.syncData(variant, colors, dates, weatherStr, enabledWidgetIdsStr.split(','), finalWp, wpFilter, fontId, fontSettings);
  }, [variant, colors, dates, weatherStr, enabledWidgetIdsStr, customWallpaper, selectedWallpaper, fontId, fontSettings, overlay.syncData]);

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
      <Stack.Screen name="WallpaperEditor" component={WallpaperEditorScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
