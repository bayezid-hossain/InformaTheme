import { createContext, useContext } from 'react';
import { darkPremium, warmLight, glassmorphism, ThemeVariant, ThemeColors, themes, themeWallpapers } from '../theme/colors';
import { CustomWallpaper } from './useThemeProvider';
import { FontId, DEFAULT_FONT_ID } from '../constants/fonts';

export interface ThemeContextValue {
  variant: ThemeVariant;
  colors: ThemeColors;
  setVariant: (v: ThemeVariant) => void;
  selectedWallpaper: ThemeVariant | null;
  setSelectedWallpaper: (w: ThemeVariant | null) => void;
  customWallpaper: CustomWallpaper | null;
  setCustomWallpaper: (cw: CustomWallpaper | null) => void;
  fontId: FontId;
  setFontId: (id: FontId) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  variant: 'darkPremium',
  colors: darkPremium,
  setVariant: () => {},
  selectedWallpaper: null,
  setSelectedWallpaper: () => {},
  customWallpaper: null,
  setCustomWallpaper: () => {},
  fontId: DEFAULT_FONT_ID,
  setFontId: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export { darkPremium, warmLight, glassmorphism, themes, themeWallpapers };
