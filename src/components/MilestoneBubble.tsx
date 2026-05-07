import { Star } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
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
  secondary?: AnchorDate;
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

  return (
    <GlassBubble style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Star size={10} color={accentColor} />
          <Text style={{ fontSize: 10 + sizeOffset, color: accentColor, letterSpacing: 0.3, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
            BORN {primary.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()} ({days.toLocaleString().toUpperCase()} DAYS AGO)
          </Text>
        </View>

        <Text style={{ fontSize: 15 + sizeOffset, color: textColor, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
          {primary.label}
        </Text>

        <Text style={{ fontSize: 13 + sizeOffset, color: text2Color, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
          Age: {age.years}y {age.months}m {age.days}d
        </Text>

        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 6 }} />

        <Text style={{ fontSize: 11 + sizeOffset, color: text3Color, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
          Next Birthday: {next.months}m {next.days}d ({next.totalDays} Days)
        </Text>
      </View>
    </GlassBubble>
  );
}
