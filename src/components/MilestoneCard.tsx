import React from 'react';
import { View, Text } from 'react-native';
import { getFontDef } from '../constants/fonts';
import { useFontSettings } from '../hooks/useFontSettings';
import { GlassBubble } from './GlassBubble';
import { totalDays, liveAge, nextEventCountdown } from '../utils/dateCalc';

interface Props {
  label: string;
  date: Date;
  accentColor: string;
  textColor: string;
  text2Color: string;
  text3Color: string;
}

export function MilestoneCard({ label, date, accentColor, textColor, text2Color, text3Color }: Props) {
  const { settings } = useFontSettings();
  const font = getFontDef(settings.milestone.fontId);
  const fontFamily = font.fontFamily;
  const sizeOffset = settings.milestone.sizeOffset;

  const days = totalDays(date);
  const age = liveAge(date);
  const next = nextEventCountdown(date);

  const prog = (days % 365) / 365;
  const percent = Math.min(100, Math.max(0, Math.round(prog * 100)));

  return (
    <GlassBubble style={{ padding: 16, width: 260 }}>
      <Text style={{ fontSize: 10.5 + sizeOffset, color: text2Color, letterSpacing: 0.5, marginBottom: 4, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
        {label.toUpperCase()} ({date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
      </Text>

      <Text style={{ fontSize: 22 + sizeOffset, color: textColor, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
        {days.toLocaleString()} Days Ago
      </Text>

      <Text style={{ fontSize: 12.5 + sizeOffset, color: text2Color, marginTop: 3, marginBottom: 12, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
        Time Elapsed: {age.years}y {age.months}m {age.days}d
      </Text>

      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 9.5 + sizeOffset, color: text3Color, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
            Annual Cycle: {percent}%
          </Text>
          <Text style={{ fontSize: 9.5 + sizeOffset, color: text3Color, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
            {next.months}m {next.days}d left
          </Text>
        </View>
        <View style={{ height: 5, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2.5, overflow: 'hidden', marginTop: 2 }}>
          <View style={{ width: `${percent}%`, height: '100%', backgroundColor: accentColor, borderRadius: 2.5 }} />
        </View>
      </View>
    </GlassBubble>
  );
}
