import React from 'react';
import { View, Text } from 'react-native';
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
  const days = totalDays(date);
  const age = liveAge(date);
  const next = nextEventCountdown(date);
  
  // Progress through the current annual cycle (0% right after anniversary, moving to 100% at the next anniversary)
  const daysInCurrentCycle = days % 365;
  const prog = daysInCurrentCycle / 365;
  const percent = Math.min(100, Math.max(0, Math.round(prog * 100)));

  return (
    <GlassBubble style={{ padding: 16, width: 260 }}>
      {/* Label & Date */}
      <Text style={{ fontSize: 10.5, color: text2Color, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 }}>
        {label.toUpperCase()} ({date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
      </Text>
      
      {/* Main Days Count */}
      <Text style={{ fontSize: 22, color: textColor, fontWeight: '800' }}>
        {days.toLocaleString()} Days Ago
      </Text>

      {/* Accurate Years/Months/Days breakdown */}
      <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 3, marginBottom: 12 }}>
        Time Elapsed: {age.years}y {age.months}m {age.days}d
      </Text>
      
      {/* Meaningful Progress Bar */}
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 9.5, color: text3Color, fontWeight: '700' }}>
            Annual Cycle: {percent}%
          </Text>
          <Text style={{ fontSize: 9.5, color: text3Color, fontWeight: '700' }}>
            {next.months}m {next.days}d left
          </Text>
        </View>
        <View style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2.5, overflow: 'hidden', marginTop: 2 }}>
          <View style={{ width: `${percent}%`, height: '100%', backgroundColor: accentColor, borderRadius: 2.5 }} />
        </View>
      </View>
    </GlassBubble>
  );
}
