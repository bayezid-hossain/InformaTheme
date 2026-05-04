import { useState } from 'react';
import { ThemeVariant, themes } from '../theme/colors';

export function useThemeProvider() {
  const [variant, setVariant] = useState<ThemeVariant>('darkPremium');
  return { variant, colors: themes[variant], setVariant };
}
