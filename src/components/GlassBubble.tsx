import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface Props {
  children: React.ReactNode;
  pill?: boolean;
  intensity?: number;
  style?: ViewStyle;
  className?: string;
}

export function GlassBubble({ children, pill = false, intensity = 30, style, className }: Props) {
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[
        {
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.22)',
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
