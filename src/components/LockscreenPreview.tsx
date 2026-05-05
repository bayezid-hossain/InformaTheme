import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock } from './Clock';
import { GlassBubble } from './GlassBubble';
import { MilestoneBubble } from './MilestoneBubble';
import { MilestoneCard } from './MilestoneCard';
import { HorizontalSlider } from './HorizontalSlider';
import { BatteryWidget } from './BatteryWidget';
import { useTheme } from '../hooks/useTheme';
import { useWeather } from '../hooks/useWeather';
import { useDateStore } from '../hooks/useDateStore';
import { Gift, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const PHONE_W = width - 64;
const PHONE_H = PHONE_W * 2.1;

function renderBackground(variant: string, colors: any) {
  switch (variant) {
    case 'deepForest':
    case 'softSage':
      return (
        <View style={StyleSheet.absoluteFillObject}>
          {/* Trees / Waves */}
          <View style={{ position: 'absolute', bottom: -50, left: -20, width: 80, height: 350, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.1)' }} />
          <View style={{ position: 'absolute', bottom: -20, left: 80, width: 70, height: 400, borderRadius: 35, backgroundColor: 'rgba(0,0,0,0.15)' }} />
          <View style={{ position: 'absolute', bottom: -60, right: 30, width: 90, height: 380, borderRadius: 45, backgroundColor: 'rgba(0,0,0,0.1)' }} />
          <View style={{ position: 'absolute', bottom: 0, left: -100, width: 600, height: 200, borderRadius: 300, backgroundColor: 'rgba(255,255,255,0.03)' }} />
        </View>
      );
    case 'midnightStars':
    case 'oceanDive':
      return (
        <View style={StyleSheet.absoluteFillObject}>
          {/* Stars / Bubbles and central circle */}
          <View style={{ position: 'absolute', top: 100, left: 20, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <View style={{ position: 'absolute', top: 150, right: 40, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' }} />
          <View style={{ position: 'absolute', top: 300, left: 60, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <View style={{ position: 'absolute', top: '45%', left: '20%', width: '60%', aspectRatio: 1, borderRadius: 1000, backgroundColor: 'rgba(0,0,0,0.2)' }} />
        </View>
      );
    case 'warmEarth':
      return (
        <View style={StyleSheet.absoluteFillObject}>
          {/* Large warm circles */}
          <View style={{ position: 'absolute', top: '35%', left: '-10%', width: '120%', aspectRatio: 1, borderRadius: 1000, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        </View>
      );
    default:
      return null;
  }
}

export function LockscreenPreview() {
  const { colors, variant } = useTheme();
  const { weather: weatherData } = useWeather();
  const { dates } = useDateStore();
  const tagline = colors.tagline || 'BEST YEARS AHEAD';
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit' }).replace(',', '').toUpperCase();
  const taglineText = `${todayDate} ▼ ${tagline} ▼`;

  const birthdays = dates.filter(d => d.type === 'birthday');
  const anniversaries = dates.filter(d => d.type === 'anniversary');
  const milestones = dates.filter(d => d.type === 'milestone');

  return (
    <View className="items-center">
      <View
        className="overflow-hidden"
        style={{
          width: PHONE_W,
          height: PHONE_H,
          borderRadius: 44,
          borderWidth: 2,
          borderColor: colors.border,
          backgroundColor: colors.bg,
        }}
      >
        <LinearGradient
          colors={[colors.bg, colors.bg1, colors.bg2]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        
        {renderBackground(variant, colors)}

        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 }}>
          {/* Battery */}
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <BatteryWidget color={colors.accent} />
          </View>

          {/* Date tagline */}
          <Text className="text-center" style={{ fontSize: 10, color: colors.text, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>
            {taglineText}
          </Text>

          {/* Clock */}
          <View className="items-center" style={{ marginBottom: 16 }}>
            <Clock style="stencil" color={colors.text} size={80} />
          </View>

          {/* Birthdays Slider */}
          {birthdays.length > 0 && (
            <HorizontalSlider>
              {birthdays.map(d => (
                <MilestoneBubble 
                  key={d.id} 
                  primary={{ label: d.label, date: new Date(d.dateISO), type: 'birthday' }} 
                  accentColor={colors.accent} 
                />
              ))}
            </HorizontalSlider>
          )}

          {/* Anniversaries Slider */}
          {anniversaries.length > 0 && (
            <HorizontalSlider>
              {anniversaries.map(d => (
                <MilestoneBubble 
                  key={d.id} 
                  primary={{ label: d.label, date: new Date(d.dateISO), type: 'anniversary' }} 
                  accentColor={colors.accent} 
                />
              ))}
            </HorizontalSlider>
          )}

          {/* Milestones Slider */}
          {milestones.length > 0 && (
            <HorizontalSlider>
              {milestones.map(d => (
                <MilestoneCard 
                  key={d.id}
                  label={d.label}
                  date={new Date(d.dateISO)}
                  accentColor={colors.accent}
                  textColor={colors.text}
                  text2Color={colors.text2}
                  text3Color={colors.text3}
                />
              ))}
            </HorizontalSlider>
          )}

          {/* Event pill (Quick highlights for soonest events) */}
          {dates.some(d => d.type !== 'milestone') && (
            <GlassBubble pill style={{ alignSelf: 'flex-start', marginTop: 12, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 12, color: colors.text, fontWeight: '700' }}>Next Event Coming Soon</Text>
                <Gift size={14} color="#F87171" />
              </View>
            </GlassBubble>
          )}

          <Text style={{ fontSize: 11, color: colors.text2, marginTop: 12, fontWeight: '500' }}>
            Fortunately, you will always be by my side, too.
          </Text>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Bottom Indicators */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ fontSize: 10, color: colors.text, fontWeight: '700' }}>TODAY, {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}</Text>
            </View>
          </View>
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 8 }}>
            <Text style={{ fontSize: 10, color: colors.accent, fontWeight: '700' }}>BATTERY 100%</Text>
          </View>
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 24 }}>
            <Text style={{ fontSize: 10, color: colors.text, fontWeight: '700' }}>WEATHER {weatherData.temp}°C ({weatherData.location})</Text>
          </View>

          {/* Unlock Slider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <View style={{ width: 80, height: 36, backgroundColor: colors.accent, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
              <Zap size={18} color={colors.bg} fill={colors.bg} />
            </View>
            <View style={{ width: 6, height: 20, backgroundColor: colors.text3, borderRadius: 3, marginLeft: 8 }} />
          </View>

          {/* Goal */}
          <Text style={{ fontSize: 11, color: colors.text2, fontWeight: '600' }}>
            Current Goal: <Text style={{ color: colors.text }}>Make memories.</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
