import { Heart, Star } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { anniversaryProgress, liveAge, nextEventCountdown, progressToNextBirthday, totalDays } from '../utils/dateCalc';
import { GlassBubble } from './GlassBubble';
import { ProgressRing } from './ProgressRing';

interface AnchorDate {
  label: string;
  date: Date;
  type: 'birthday' | 'anniversary' | 'milestone';
}

interface Props {
  primary: AnchorDate;
  secondary?: AnchorDate;
  accentColor?: string;
}

export function MilestoneBubble({ primary, secondary, accentColor = '#4ade80' }: Props) {
  const age = liveAge(primary.date);
  const days = totalDays(primary.date);
  const next = nextEventCountdown(primary.date);

  return (
    <GlassBubble style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ gap: 4 }}>
        {/* Born days ago header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Star size={10} color={accentColor} />
          <Text style={{ fontSize: 10, color: accentColor, fontWeight: '700', letterSpacing: 0.3 }}>
            BORN {primary.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()} ({days.toLocaleString().toUpperCase()} DAYS AGO)
          </Text>
        </View>

        {/* Label (e.g. Wife, Luka) */}
        <Text style={{ fontSize: 15, color: '#fff', fontWeight: '800' }}>
          {primary.label}
        </Text>

        {/* Age */}
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
          Age: {age.years}y {age.months}m {age.days}d
        </Text>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 6 }} />

        {/* Next Birthday countdown */}
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
          Next Birthday: {next.months}m {next.days}d ({next.totalDays} Days)
        </Text>
      </View>
    </GlassBubble>
  );
}
