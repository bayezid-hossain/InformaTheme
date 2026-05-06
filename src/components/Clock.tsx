import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

type ClockStyle = 'stencil' | 'mono' | 'bold';

interface Props {
  style?: ClockStyle;
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
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return { h: hours.toString(), m: minutes, ampm };
  };

  const [time, setTime] = useState(getFormattedTime());
  useEffect(() => {
    const id = setInterval(() => {
      setTime(getFormattedTime());
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const FONT_MAP: Record<ClockStyle, string> = {
  stencil: 'SirinStencil_400Regular',
  mono: 'SpaceMono_700Bold',
  bold: 'SpaceGrotesk_700Bold',
};

const SIZE_MAP: Record<ClockStyle, number> = {
  stencil: 68,
  mono: 60,
  bold: 64,
};

const TRACKING_MAP: Record<ClockStyle, number> = {
  stencil: 2,
  mono: -2,
  bold: -3,
};

export function Clock({ style = 'stencil', color = '#ffffff', size }: Props) {
  const { h, m, ampm } = useLiveClock();
  const fontSize = size ?? SIZE_MAP[style];

  return (
    <View className="items-center flex-row">
      <Text
        style={{
          fontFamily: FONT_MAP[style],
          fontSize,
          color,
          letterSpacing: TRACKING_MAP[style],
          lineHeight: fontSize,
        }}
      >
        {h}:{m}
      </Text>
      <Text
        style={{
          fontFamily: FONT_MAP[style],
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
