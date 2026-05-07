import React from 'react';
import { View, Text } from 'react-native';
import { useBattery } from '../hooks/useBattery';

interface Props {
  color?: string;
  fontFamily?: string;
  sizeOffset?: number;
}

export function BatteryWidget({ color = '#4ade80', fontFamily, sizeOffset = 0 }: Props) {
  const { level, charging } = useBattery();
  const pct = Math.round(level * 100);

  return (
    <View className="flex-row items-center">
      {/* Percentage Text (bold white) */}
      <Text style={{ fontSize: 11 + sizeOffset, color: '#fff', ...(fontFamily ? { fontFamily } : { fontWeight: '900' }) }}>
        {pct}%
      </Text>
      
      {/* Thunderbolt (accent/theme colored!) */}
      {charging && (
        <Text style={{ fontSize: 11 + sizeOffset, color, ...(fontFamily ? { fontFamily } : { fontWeight: '900' }) }}>
          {' ⚡'}
        </Text>
      )}
    </View>
  );
}
