import React from 'react';
import { View, Text } from 'react-native';
import { useBattery } from '../hooks/useBattery';

interface Props {
  color?: string;
}

export function BatteryWidget({ color = '#4ade80' }: Props) {
  const { level, charging } = useBattery();
  const pct = Math.round(level * 100);

  return (
    <View className="flex-row items-center">
      {/* Percentage Text (bold white) */}
      <Text className="font-extrabold text-white text-[11px]">
        {pct}%
      </Text>
      
      {/* Thunderbolt (accent/theme colored!) */}
      {charging && (
        <Text className="font-extrabold text-[11px]" style={{ color }}>
          {' ⚡'}
        </Text>
      )}
    </View>
  );
}
