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
  const now = new Date();
  const [time, setTime] = useState({ h: pad(now.getHours()), m: pad(now.getMinutes()) });
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setTime({ h: pad(d.getHours()), m: pad(d.getMinutes()) });
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
  const { h, m } = useLiveClock();
  const fontSize = size ?? SIZE_MAP[style];

  return (
    <View className="items-center">
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
    </View>
  );
}
