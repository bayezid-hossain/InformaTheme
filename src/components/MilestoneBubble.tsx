import { Gift } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getFontDef } from '../constants/fonts';
import { useFontSettings } from '../hooks/useFontSettings';
import { liveAge, nextEventCountdown, totalDays } from '../utils/dateCalc';
import { GlassBubble } from './GlassBubble';

interface AnchorDate {
  label: string;
  date: Date;
  type: 'birthday' | 'anniversary' | 'milestone';
}

interface Props {
  primary: AnchorDate;
  accentColor?: string;
  textColor?: string;
  text2Color?: string;
  text3Color?: string;
}

export function MilestoneBubble({
  primary,
  accentColor = '#4ade80',
  textColor = '#fff',
  text2Color = 'rgba(255,255,255,0.85)',
  text3Color = 'rgba(255,255,255,0.6)',
}: Props) {
  const { settings } = useFontSettings();
  const font = getFontDef(settings.birthday.fontId);
  const fontFamily = font.fontFamily;
  const sizeOffset = settings.birthday.sizeOffset;

  const age = liveAge(primary.date);
  const days = totalDays(primary.date);
  const next = nextEventCountdown(primary.date);

  // Birthday progress: 100% when birthday is today, 0% right after birthday.
  const progress = (365 - next.totalDays) / 365;

  // Glowing dot position on semi-circle path A 35 35 (centered at 50, 42)
  const r = 32;
  const cx = 50;
  const cy = 40;
  const theta = Math.PI - (progress * Math.PI);
  const dotX = cx + r * Math.cos(theta);
  const dotY = cy - r * Math.sin(theta);

  // Dynamic scaling based on sizeOffset
  const cardWidth = 260 + sizeOffset * 8;
  const svgW = 150 + sizeOffset * 10;
  const svgH = 60 + sizeOffset * 4.0;

  return (
    <GlassBubble style={{ padding: 14, width: cardWidth }}>
      {/* Top Header Row with Icon and Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Gift size={16} color={accentColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 13.5 + sizeOffset, color: textColor, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
            {primary.label}
          </Text>
          <Text style={{ fontSize: 11 + sizeOffset, color: text2Color, marginTop: 1, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
            Age: {age.label}
          </Text>
        </View>
      </View>

      {/* Center Semi-Circular Gauge Arc */}
      <View style={{ alignItems: 'center', justifyContent: 'center', height: svgH, marginTop: 4 }}>
        <Svg width={svgW} height={svgH} viewBox="0 0 100 45">
          {/* Background Track */}
          <Path
            d="M 18 40 A 32 32 0 0 1 82 40"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
          {/* Progress Path (semi-circle perimeter length is Math.PI * 32 = 100.53) */}
          <Path
            d="M 18 40 A 32 32 0 0 1 82 40"
            stroke={accentColor}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${progress * 101} 101`}
          />
          {/* Glowing Dot at end of Progress */}
          <Circle
            cx={dotX}
            cy={dotY}
            r={3}
            fill="#fff"
          />
        </Svg>

        {/* Centered text inside the Arc */}
        <View style={{ position: 'absolute', bottom: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 14 + sizeOffset * 0.7, color: textColor, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
            {next.totalDays} Days
          </Text>
          <Text style={{ fontSize: 8 + sizeOffset * 0.5, color: text3Color, marginTop: 1, letterSpacing: 0.3, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
            Next Birthday
          </Text>
        </View>
      </View>
    </GlassBubble>
  );
}
