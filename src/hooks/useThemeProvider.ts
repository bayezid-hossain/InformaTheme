import { useState, useEffect } from 'react';
import { ThemeVariant, themes } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WallpaperFilterId } from '../constants/wallpaperFilters';
import { FontId, DEFAULT_FONT_ID } from '../constants/fonts';

export type CustomWallpaper = { uri: string; filter: WallpaperFilterId };

export function useThemeProvider() {
  const [variant, setVariantState] = useState<ThemeVariant>('darkPremium');
  const [selectedWallpaper, setSelectedWallpaperState] = useState<ThemeVariant | null>(null);
  const [customWallpaper, setCustomWallpaperState] = useState<CustomWallpaper | null>(null);
  const [fontId, setFontIdState] = useState<FontId>(DEFAULT_FONT_ID);

  useEffect(() => {
    AsyncStorage.getItem('theme_variant').then(v => {
      if (v) setVariantState(v as ThemeVariant);
    });
    AsyncStorage.getItem('selected_wallpaper').then(w => {
      if (w) setSelectedWallpaperState(w as ThemeVariant);
    });
    AsyncStorage.getItem('custom_wallpaper').then(json => {
      if (json) setCustomWallpaperState(JSON.parse(json) as CustomWallpaper);
    });
    AsyncStorage.getItem('theme_font').then(f => {
      if (f) setFontIdState(f as FontId);
    });
  }, []);

  const setVariant = (v: ThemeVariant) => {
    setVariantState(v);
    AsyncStorage.setItem('theme_variant', v);
    
    // If no custom gallery wallpaper is set, reset selectedWallpaper 
    // so it follows the new theme default automatically.
    if (!customWallpaper) {
      setSelectedWallpaperState(null);
      AsyncStorage.removeItem('selected_wallpaper');
    }
  };

  const setSelectedWallpaper = (w: ThemeVariant | null) => {
    setSelectedWallpaperState(w);
    if (w) AsyncStorage.setItem('selected_wallpaper', w);
    else AsyncStorage.removeItem('selected_wallpaper');
  };

  const setCustomWallpaper = (cw: CustomWallpaper | null) => {
    setCustomWallpaperState(cw);
    if (cw) AsyncStorage.setItem('custom_wallpaper', JSON.stringify(cw));
    else AsyncStorage.removeItem('custom_wallpaper');
  };

  const setFontId = (id: FontId) => {
    setFontIdState(id);
    AsyncStorage.setItem('theme_font', id);
  };

  return {
    variant,
    colors: themes[variant],
    setVariant,
    selectedWallpaper,
    setSelectedWallpaper,
    customWallpaper,
    setCustomWallpaper,
    fontId,
    setFontId,
  };
}
