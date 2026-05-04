import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock } from './Clock';
import { GlassBubble } from './GlassBubble';
import { MilestoneBubble } from './MilestoneBubble';
import { BatteryWidget } from './BatteryWidget';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');
const PHONE_W = width - 64;
const PHONE_H = PHONE_W * 2.1;

const PRIMARY_DATE = { label: "Luka's Birthday", date: new Date('2020-06-15'), type: 'birthday' as const };
const SECONDARY_DATE = { label: 'Anniversary', date: new Date('2018-09-22'), type: 'anniversary' as const };

export function LockscreenPreview() {
  const { colors } = useTheme();

  return (
    <View className="items-center">
      {/* Phone frame */}
      <View
        className="overflow-hidden"
        style={{
          width: PHONE_W,
          height: PHONE_H,
          borderRadius: 44,
          borderWidth: 2,
          borderColor: colors.border,
        }}
      >
        <LinearGradient
          colors={['#0f1f14', '#0a1020', '#1a0f20']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 8 }}
        >

          {/* Date tagline */}
          <Text className="text-center" style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>

          {/* Clock */}
          <View className="items-center" style={{ marginVertical: 4 }}>
            <Clock style="stencil" color="#ffffff" />
          </View>

          {/* Milestone bubble */}
          <MilestoneBubble primary={PRIMARY_DATE} secondary={SECONDARY_DATE} accentColor={colors.accent} />

          {/* Event pill */}
          <GlassBubble pill style={{ alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 11, color: '#fff' }}>🎂 Wife's Birthday · 18 days</Text>
          </GlassBubble>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Battery */}
          <BatteryWidget color={colors.accent} />

          {/* Goal */}
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Current Goal: <Text style={{ color: colors.accent }}>Stay consistent 🌱</Text>
          </Text>

          {/* Bottom icons */}
          <View className="flex-row justify-between items-center mt-2 px-4">
            {['📞', '📸', '⚡'].map((icon, i) => (
              <View key={i} className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                <Text style={{ fontSize: 20 }}>{icon}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
