import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  progress: number; // 0–1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  fontFamily?: string;
  sizeOffset?: number;
  textColor?: string;
  sublabelColor?: string;
}

export function ProgressRing({
  progress,
  size = 70,
  strokeWidth = 4,
  color = '#4ade80',
  trackColor = 'rgba(255,255,255,0.15)',
  label,
  sublabel,
  fontFamily,
  sizeOffset = 0,
  textColor = 'rgba(255,255,255,0.75)',
  sublabelColor = '#fff',
}: Props) {
  const radius = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ * Math.min(1, Math.max(0, progress));
  const cx = size / 2;

  return (
    <View className="items-center" style={{ gap: 4 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cx} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={cx} cy={cx} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${cx}, ${cx}`}
          />
        </Svg>
        {sublabel && (
          <View className="absolute inset-0 items-center justify-center">
            <Text style={{ fontSize: 11 + sizeOffset, color: sublabelColor, ...(fontFamily ? { fontFamily } : { fontWeight: '700' }) }}>{sublabel}</Text>
          </View>
        )}
      </View>
      {label && (
        <Text style={{ fontSize: 9 + sizeOffset, color: textColor, textAlign: 'center', maxWidth: size, ...(fontFamily ? { fontFamily } : { fontWeight: '600' }) }}>
          {label}
        </Text>
      )}
    </View>
  );
}
