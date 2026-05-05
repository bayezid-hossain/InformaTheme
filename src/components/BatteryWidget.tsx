import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useBattery } from '../hooks/useBattery';
import { Zap } from 'lucide-react-native';

interface Props {
  color?: string;
}

export function BatteryWidget({ color = '#4ade80' }: Props) {
  const { level, charging } = useBattery();
  const pct = Math.round(level * 100);
  const width = useSharedValue(level);

  React.useEffect(() => {
    width.value = withTiming(level, { duration: 1000 });
  }, [level]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as any,
  }));

  const fillColor = pct <= 20 ? '#ef4444' : pct <= 40 ? '#f59e0b' : color;

  return (
    <View className="flex-row items-center gap-2">
      {/* Cable */}
      <View className="flex-1 h-0.5 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />

      {/* Battery body */}
      <View
        className="items-center justify-center overflow-hidden rounded-[10px] border"
        style={{ width: 110, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }}
      >
        {/* Fill */}
        <Animated.View
          className="absolute left-0 top-0 bottom-0 rounded-[10px]"
          style={[{ backgroundColor: fillColor }, fillStyle]}
        />
        {/* Bolt icon */}
        {charging && (
          <Zap size={16} color="white" fill="white" className="absolute z-10" />
        )}
        {/* Pct text */}
        <Text className="z-10 font-bold text-white text-sm">{pct}%</Text>
      </View>

      {/* Nub */}
      <View className="w-[5px] h-4 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
    </View>
  );
}
