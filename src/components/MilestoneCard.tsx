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
  
  // Progress segments (just for design as in the reference image)
  const segments = [1, 2, 3, 4, 5, 6];
  const activeCount = 3; // Mocking some progress as in the image

  return (
    <GlassBubble style={{ padding: 16 }}>
      <Text style={{ fontSize: 11, color: text2Color, fontWeight: '600' }}>{label}:</Text>
      <Text style={{ fontSize: 24, color: textColor, fontWeight: '800', marginBottom: 8 }}>
        {days.toLocaleString()} Days Ago
      </Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {segments.map((i) => (
          <View 
            key={i} 
            style={{ 
              height: 4, 
              flex: 1, 
              backgroundColor: i <= activeCount ? accentColor : 'rgba(255,255,255,0.1)', 
              borderRadius: 2 
            }} 
          />
        ))}
        <Text style={{ fontSize: 10, color: text3Color, fontWeight: '700', marginLeft: 4 }}>
          {Math.floor(days * 45.6).toString().slice(0, 5)}
        </Text>
      </View>
    </GlassBubble>
  );
}
