import React from 'react';
import { View, Text } from 'react-native';
import { GlassBubble } from './GlassBubble';
import { ProgressRing } from './ProgressRing';
import { liveAge, totalDays, daysUntilNextBirthday, progressToNextBirthday, anniversaryProgress } from '../utils/dateCalc';
import { Star, Heart } from 'lucide-react-native';

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
  const nextBday = daysUntilNextBirthday(primary.date);
  const bProg = progressToNextBirthday(primary.date);
  const aProg = secondary ? anniversaryProgress(secondary.date) : 0;

  return (
    <GlassBubble style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
      <View className="flex-row items-center gap-3">
        {/* Text content */}
        <View className="flex-1" style={{ gap: 3 }}>
          <View className="flex-row items-center gap-1">
            <Star size={10} color="rgba(255,255,255,0.65)" />
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>
              Born {days.toLocaleString()} days ago
            </Text>
            <Heart size={10} color="rgba(255,255,255,0.65)" />
          </View>
          <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
            <Text style={{ color: accentColor }}>{primary.label.split(' ')[0]}</Text>
            {`'s Live Age: ${age.years}y ${age.months}m ${age.days}d`}
          </Text>
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
            Next Birthday: {nextBday} days
          </Text>
          {/* Progress bar */}
          <View className="h-0.5 rounded-full overflow-hidden mt-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <View style={{ width: `${bProg * 100}%`, height: 2, backgroundColor: accentColor, opacity: 0.7, borderRadius: 999 }} />
          </View>
        </View>

        {/* Rings */}
        <View className="flex-row" style={{ gap: 10 }}>
          <ProgressRing progress={aProg} size={56} strokeWidth={4} color={accentColor} label={secondary ? 'Anniv' : ''} sublabel={`${Math.round(aProg * 100)}%`} />
          <ProgressRing progress={bProg} size={56} strokeWidth={4} color={accentColor} label="Growth" sublabel={`${age.years}y`} />
        </View>
      </View>
    </GlassBubble>
  );
}
