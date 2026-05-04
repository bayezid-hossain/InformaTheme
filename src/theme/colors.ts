export const darkPremium = {
  bg: '#0d0f12',
  bg1: '#13161c',
  bg2: '#1a1e27',
  bg3: '#222736',
  accent: '#4ade80',
  accentDim: 'rgba(74,222,128,0.15)',
  text: '#e8ecf2',
  text2: '#8892a4',
  text3: '#4a5568',
  border: 'rgba(255,255,255,0.07)',
  card: 'rgba(255,255,255,0.06)',
  statusBg: 'transparent',
} as const;

export const warmLight = {
  bg: '#faf7f2',
  bg1: '#ffffff',
  bg2: '#ffffff',
  bg3: '#f0ede8',
  accent: '#2d7a4a',
  accentDim: 'rgba(45,122,74,0.12)',
  text: '#1a1a1a',
  text2: '#6b6b6b',
  text3: '#9a9a9a',
  border: 'rgba(0,0,0,0.07)',
  card: 'rgba(0,0,0,0.04)',
  statusBg: '#faf7f2',
} as const;

export const glassmorphism = {
  bg: '#0f1f14',
  bg1: 'rgba(255,255,255,0.06)',
  bg2: 'rgba(255,255,255,0.08)',
  bg3: 'rgba(255,255,255,0.10)',
  accent: '#4ade80',
  accentDim: 'rgba(74,222,128,0.15)',
  text: '#e8ecf2',
  text2: '#8892a4',
  text3: '#4a5568',
  border: 'rgba(255,255,255,0.12)',
  card: 'rgba(255,255,255,0.06)',
  statusBg: 'transparent',
} as const;

export type ThemeVariant = 'darkPremium' | 'warmLight' | 'glassmorphism';

export interface ThemeColors {
  bg: string;
  bg1: string;
  bg2: string;
  bg3: string;
  accent: string;
  accentDim: string;
  text: string;
  text2: string;
  text3: string;
  border: string;
  card: string;
  statusBg: string;
}

export const themes: Record<ThemeVariant, ThemeColors> = {
  darkPremium,
  warmLight,
  glassmorphism,
};
