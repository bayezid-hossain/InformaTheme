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

export const deepForest = {
  bg: '#0A1A10',
  bg1: '#0F2417',
  bg2: '#142E1E',
  bg3: '#1A3825',
  accent: '#4ADE80',
  accentDim: 'rgba(74,222,128,0.15)',
  text: '#F0FDF4',
  text2: '#BBF7D0',
  text3: '#86EFAC',
  border: 'rgba(74,222,128,0.12)',
  card: 'rgba(74,222,128,0.06)',
  statusBg: 'transparent',
  tagline: 'BEST YEARS AHEAD',
} as const;

export const softSage = {
  bg: '#E2E8F0',
  bg1: '#CBD5E1',
  bg2: '#94A3B8',
  bg3: '#64748B',
  accent: '#4ADE80',
  accentDim: 'rgba(74,222,128,0.2)',
  text: '#0F172A',
  text2: '#334155',
  text3: '#475569',
  border: 'rgba(0,0,0,0.1)',
  card: 'rgba(0,0,0,0.05)',
  statusBg: 'transparent',
  tagline: 'ALL BEST 2025',
} as const;

export const midnightStars = {
  bg: '#0B0F19',
  bg1: '#111827',
  bg2: '#1F2937',
  bg3: '#374151',
  accent: '#60A5FA',
  accentDim: 'rgba(96,165,250,0.15)',
  text: '#F8FAFC',
  text2: '#E2E8F0',
  text3: '#94A3B8',
  border: 'rgba(96,165,250,0.12)',
  card: 'rgba(96,165,250,0.06)',
  statusBg: 'transparent',
  tagline: 'REACH THE STARS',
} as const;

export const oceanDive = {
  bg: '#081F2D',
  bg1: '#0C2E42',
  bg2: '#103D57',
  bg3: '#144C6C',
  accent: '#22D3EE',
  accentDim: 'rgba(34,211,238,0.15)',
  text: '#ECFEFF',
  text2: '#CFFAFE',
  text3: '#67E8F9',
  border: 'rgba(34,211,238,0.12)',
  card: 'rgba(34,211,238,0.06)',
  statusBg: 'transparent',
  tagline: 'DIVE DEEPER',
} as const;

export const warmEarth = {
  bg: '#2C1A0D',
  bg1: '#3E2513',
  bg2: '#503019',
  bg3: '#623B1F',
  accent: '#FBBF24',
  accentDim: 'rgba(251,191,36,0.15)',
  text: '#FFFBEB',
  text2: '#FEF3C7',
  text3: '#FDE68A',
  border: 'rgba(251,191,36,0.12)',
  card: 'rgba(251,191,36,0.06)',
  statusBg: 'transparent',
  tagline: 'SEIZE THE DAY',
} as const;

export type ThemeVariant = 'darkPremium' | 'warmLight' | 'glassmorphism' | 'deepForest' | 'softSage' | 'midnightStars' | 'oceanDive' | 'warmEarth';

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
  tagline?: string;
}

export const themes: Record<ThemeVariant, ThemeColors> = {
  darkPremium,
  warmLight,
  glassmorphism,
  deepForest,
  softSage,
  midnightStars,
  oceanDive,
  warmEarth,
};
