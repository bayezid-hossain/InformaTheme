import { Star } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { getFontDef } from '../constants/fonts';
import { useFontSettings } from '../hooks/useFontSettings';
import { liveAge, nextEventCountdown, totalDays } from '../utils/dateCalc';
import { GlassBubble } from './GlassBubble';

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

  const cardWidth = 260 + sizeOffset * 8;
  const barWidth = 110 + sizeOffset * 4;

  return (
    <GlassBubble style={{ padding: 14, width: cardWidth }}>
      {/* Top row: Icon on left, Label on right */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Star size={16} color={accentColor} fill={accentColor} />
        </View>
        <Text style={{ fontSize: 13 + sizeOffset, color: textColor, fontWeight: '700', ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : {}) }}>
          {label}
        </Text>
      </View>

      {/* Bottom row: Stat on left, Progress bar on right */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
        {/* Days count */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22 + sizeOffset, color: textColor, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
            {days.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 11 + sizeOffset, color: text2Color, marginTop: 1, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
            Days Ago
          </Text>
        </View>

        {/* Progress bar container */}
        <View style={{ width: barWidth, gap: 4 }}>
          {/* Progress bar */}
          <View style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2.5, overflow: 'hidden' }}>
            <View style={{ width: `${percent}%`, height: '100%', backgroundColor: accentColor, borderRadius: 2.5 }} />
          </View>
          <Text style={{ fontSize: 8.5 + sizeOffset, color: text3Color, textAlign: 'right', ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
            Annual Cycle: {percent}%
          </Text>
          <Text style={{ fontSize: 8.5 + sizeOffset, color: text3Color, textAlign: 'right', ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
            {next.months}m {next.days}d left
          </Text>
        </View>
      </View>
    </GlassBubble>
  );
}
