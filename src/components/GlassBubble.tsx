import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  pill?: boolean;
  intensity?: number;
  style?: ViewStyle;
  className?: string;
}

export function GlassBubble({ children, pill = false, intensity = 30, style, className }: Props) {
  const { variant } = useTheme();
  const isLight = variant === 'warmLight' || variant === 'softSage';

  return (
    <BlurView
      intensity={intensity}
      tint={isLight ? 'light' : 'dark'}
      style={[
        {
          backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.22)',
          borderRadius: pill ? 999 : 14,
          overflow: 'hidden',
          paddingHorizontal: pill ? 10 : 10,
          paddingVertical: pill ? 4 : 8,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}
