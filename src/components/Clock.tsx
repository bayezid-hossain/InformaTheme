import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getFontDef } from '../constants/fonts';
import { useFontSettings } from '../hooks/useFontSettings';

interface Props {
  color?: string;
  size?: number;
}

function pad(n: number) { return n.toString().padStart(2, '0'); }

function useLiveClock() {
  const getFormattedTime = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return { h: hours.toString(), m: minutes, ampm };
  };

  const [time, setTime] = useState(getFormattedTime());
  useEffect(() => {
    const id = setInterval(() => setTime(getFormattedTime()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function Clock({ color = '#ffffff', size }: Props) {
  const { settings } = useFontSettings();
  const font = getFontDef(settings.clock.fontId);
  const { h, m, ampm } = useLiveClock();
  const fontSize = (size ?? font.clockSize) + settings.clock.sizeOffset;

  return (
    <View className="items-center flex-row">
      <Text
        style={{
          fontFamily: font.fontFamily,
          fontWeight: font.fontWeight as any,
          fontSize,
          color,
          letterSpacing: font.clockTracking,
          lineHeight: fontSize,
        }}
      >
        {h}:{m}
      </Text>
      <Text
        style={{
          fontFamily: font.fontFamily,
          fontWeight: font.fontWeight as any,
          fontSize: fontSize * 0.25,
          color,
          marginLeft: 4,
          opacity: 0.8,
          alignSelf: 'flex-end',
          marginBottom: fontSize * 0.1,
        }}
      >
        {ampm}
      </Text>
    </View>
  );
}
