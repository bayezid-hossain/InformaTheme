import { createContext, useContext } from 'react';
import { darkPremium, warmLight, glassmorphism, ThemeVariant, ThemeColors, themes } from '../theme/colors';

export interface ThemeContextValue {
  variant: ThemeVariant;
  colors: ThemeColors;
  setVariant: (v: ThemeVariant) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  variant: 'darkPremium',
  colors: darkPremium,
  setVariant: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export { darkPremium, warmLight, glassmorphism, themes };
