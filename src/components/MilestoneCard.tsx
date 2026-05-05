import React from 'react';
import { View, Text } from 'react-native';
import { GlassBubble } from './GlassBubble';
import { totalDays } from '../utils/dateCalc';

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
  
  const prog = (days % 365) / 365;

  return (
    <GlassBubble style={{ padding: 16 }}>
      <Text style={{ fontSize: 11, color: text2Color, fontWeight: '600' }}>
        {label} ({date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}):
      </Text>
      <Text style={{ fontSize: 24, color: textColor, fontWeight: '800', marginBottom: 8 }}>
        {days.toLocaleString()} Days Ago
      </Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: prog, height: 4, backgroundColor: accentColor, borderRadius: 2, marginRight: 2 }} />
        <View style={{ flex: Math.max(0.001, 1 - prog), height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
        <Text style={{ fontSize: 10, color: text3Color, fontWeight: '800', marginLeft: 8 }}>
          {days.toString().split('').join(' ')}
        </Text>
      </View>
    </GlassBubble>
  );
}
