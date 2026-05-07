import React from 'react';
import { Heart } from 'lucide-react-native';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { getFontDef } from '../constants/fonts';
import { getFilterOverlay } from '../constants/wallpaperFilters';
import { useDateStore } from '../hooks/useDateStore';
import { useFontSettings } from '../hooks/useFontSettings';
import { themeWallpapers, useTheme } from '../hooks/useTheme';
import { useWeather } from '../hooks/useWeather';
import { liveAge, nextEventCountdown, totalDays } from '../utils/dateCalc';
import { Clock } from './Clock';
import { GlassBubble } from './GlassBubble';
import { HorizontalSlider } from './HorizontalSlider';
import { MilestoneBubble } from './MilestoneBubble';
import { MilestoneCard } from './MilestoneCard';

import { useBattery } from '../hooks/useBattery';
import { useWidgetStore } from '../hooks/useWidgetStore';

const { width, height } = Dimensions.get('window');
const PHONE_W = width - 64;
const PHONE_H = PHONE_W * 2.1;


interface AnniversaryCardProps {
  label: string;
  date: Date;
  accentColor: string;
  textColor: string;
  text3Color: string;
}

function AnniversaryCard({ label, date, accentColor, textColor, text3Color }: AnniversaryCardProps) {
  const { settings } = useFontSettings();
  const font = getFontDef(settings.anniversary.fontId);
  const fontFamily = font.fontFamily;
  const sizeOffset = settings.anniversary.sizeOffset;
  const age = liveAge(date);
  const daysSince = totalDays(date);
  const prog = (daysSince % 365) / 365;
  const sublabel = age.years >= 1 ? `${age.years}y` : `${daysSince}d`;
  const next = nextEventCountdown(date);

  const cardWidth = 260 + sizeOffset * 8;
  const ringSize = 54 + sizeOffset * 2;

  return (
    <GlassBubble style={{ width: cardWidth, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
        <Heart size={ringSize} color={accentColor} fill={accentColor} />
        <Text style={{ position: 'absolute', color: '#fff', fontSize: 11 + sizeOffset, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '800' }) }}>
          {sublabel}
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text numberOfLines={1} style={{ fontSize: 13.5 + sizeOffset, color: textColor, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '700' }) }}>
          {label}
        </Text>
        <Text style={{ fontSize: 10 + sizeOffset, color: text3Color, marginTop: 2, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
          Since {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text style={{ fontSize: 9.5 + sizeOffset, color: text3Color, marginTop: 2, ...(fontFamily ? { fontFamily, fontWeight: font.fontWeight as any } : { fontWeight: '600' }) }}>
          Next: {next.months}m {next.days}d ({next.totalDays}d)
        </Text>
      </View>
    </GlassBubble>
  );
}

interface LockscreenPreviewProps {
  wallpaperUri?: string | number;
  filterOverlay?: { color: string; opacity: number } | null;
  isFullScreen?: boolean;
}

export function LockscreenPreview({ wallpaperUri, filterOverlay, isFullScreen = false }: LockscreenPreviewProps = {}) {
  const { colors, variant, customWallpaper } = useTheme();
  const { weather: weatherData } = useWeather();
  const { dates } = useDateStore();
  const { widgets } = useWidgetStore();
  const { settings: fontSettings } = useFontSettings();

  const otherFont = getFontDef(fontSettings.others.fontId);

  const isEnabled = (id: string) => {
    const w = widgets.find(x => x.id === id);
    return w ? w.enabled : true;
  };

  const tagline = colors.tagline || 'BEST YEARS AHEAD';
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit' }).replace(',', '').toUpperCase();
  const taglineText = `${todayDate} ▼ ${tagline} ▼`;

  const birthdays = [...dates]
    .filter(d => d.type === 'birthday')
    .sort((a, b) => {
      const daysA = nextEventCountdown(new Date(a.dateISO)).totalDays;
      const daysB = nextEventCountdown(new Date(b.dateISO)).totalDays;
      return daysA - daysB; // closest upcoming birthday first
    });

  const anniversaries = [...dates]
    .filter(d => d.type === 'anniversary')
    .sort((a, b) => {
      const daysA = nextEventCountdown(new Date(a.dateISO)).totalDays;
      const daysB = nextEventCountdown(new Date(b.dateISO)).totalDays;
      return daysA - daysB; // closest upcoming anniversary first
    });

  const milestones = [...dates]
    .filter(d => d.type === 'milestone')
    .sort((a, b) => {
      const daysA = totalDays(new Date(a.dateISO));
      const daysB = totalDays(new Date(b.dateISO));
      return daysA - daysB; // smallest days elapsed (most recent milestone) first
    });

  const { level, charging } = useBattery();
  const pct = Math.round(level * 100);

  // Hierarchy: Prop > Custom Gallery > Theme Default WP
  // We ignore selectedWallpaper here because the user wants theme defaults to show 
  // unless a custom gallery wallpaper is active.
  const activeWallpaper = wallpaperUri ||
    (customWallpaper ? customWallpaper.uri : themeWallpapers[variant]);

  // Hierarchy: Prop Filter > Custom Gallery Filter > Default for Variant
  const activeFilter = filterOverlay !== undefined ? filterOverlay : (customWallpaper ? getFilterOverlay(customWallpaper.filter) : null);

  const containerStyle = {
    width: isFullScreen ? width : PHONE_W,
    height: isFullScreen ? height : PHONE_H,
    borderRadius: isFullScreen ? 0 : 44,
    borderWidth: isFullScreen ? 0 : 2,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    overflow: 'hidden' as const,
  };

  const renderContent = () => (
    <>
      <Image
        source={typeof activeWallpaper === 'number' ? activeWallpaper : { uri: activeWallpaper }}
        style={StyleSheet.absoluteFillObject}
        resizeMode={typeof activeWallpaper === 'number' ? "stretch" : "cover"}
      />
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: (variant === 'warmLight' || variant === 'softSage' || variant === 'roseQuartz')
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(0,0,0,0.5)'
          }
        ]}
      />

      {activeFilter && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: activeFilter.color, opacity: activeFilter.opacity }]} />
      )}

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: isFullScreen ? 60 : 52, paddingBottom: isFullScreen ? 110 : 60 }}>

        {/* Date tagline */}
        {isEnabled('clock') && (
          <Text className="text-center" style={{ fontSize: 10 + fontSettings.others.sizeOffset, color: colors.text, letterSpacing: 1, marginBottom: 4, ...(otherFont.fontFamily ? { fontFamily: otherFont.fontFamily, fontWeight: otherFont.fontWeight as any } : { fontWeight: '700' }) }}>
            {taglineText}
          </Text>
        )}

        {/* Clock */}
        {isEnabled('clock') && (
          <View className="items-center" style={{ marginBottom: 16 }}>
            <Clock color={colors.text} size={80} />
          </View>
        )}

        {/* Birthdays Slider */}
        {isEnabled('birthday') && birthdays.length > 0 && (
          <HorizontalSlider>
            {birthdays.map(d => (
              <MilestoneBubble
                key={d.id}
                primary={{ label: d.label, date: new Date(d.dateISO), type: 'birthday' }}
                accentColor={colors.accent}
                textColor={colors.text}
                text2Color={colors.text2}
                text3Color={colors.text3}
              />
            ))}
          </HorizontalSlider>
        )}

        {/* Anniversaries Slider */}
        {isEnabled('anniversary') && anniversaries.length > 0 && (
          <HorizontalSlider>
            {anniversaries.map(d => (
              <AnniversaryCard
                key={d.id}
                label={d.label}
                date={new Date(d.dateISO)}
                accentColor={colors.accent}
                textColor={colors.text}
                text3Color={colors.text3}
              />
            ))}
          </HorizontalSlider>
        )}

        {/* Milestones Slider */}
        {isEnabled('milestone') && milestones.length > 0 && (
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

        {/* Quote */}
        <Text
          style={{
            fontSize: 12 + fontSettings.others.sizeOffset,
            color: colors.text2,
            marginTop: 12,
            fontStyle: 'italic',
            textAlign: 'center',
            ...(otherFont.fontFamily ? { fontFamily: otherFont.fontFamily, fontWeight: otherFont.fontWeight as any } : { fontWeight: '500' })
          }}
        >
          "{(['Every day counts.', 'Time reveals what matters.', 'The present is a gift.', 'Growth takes patience.', 'Moments become memories.'])[Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000) % 5]}"
        </Text>

        {/* Spacer */}
        <View className="flex-1" />

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: (variant === 'warmLight' || variant === 'softSage') ? colors.bg2 : 'rgba(0,0,0,0.2)',
              borderWidth: 1,
              borderColor: (variant === 'warmLight' || variant === 'softSage') ? colors.border : 'rgba(255,255,255,0.1)'
            }}
          >
            <Text style={{ fontSize: 10 + fontSettings.others.sizeOffset, color: colors.text, ...(otherFont.fontFamily ? { fontFamily: otherFont.fontFamily, fontWeight: otherFont.fontWeight as any } : { fontWeight: '700' }) }}>TODAY, {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}</Text>
          </View>
        </View>
        {isEnabled('weather') && (
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: (variant === 'warmLight' || variant === 'softSage') ? colors.bg2 : 'rgba(0,0,0,0.2)',
              borderWidth: 1,
              borderColor: (variant === 'warmLight' || variant === 'softSage') ? colors.border : 'rgba(255,255,255,0.1)',
              marginBottom: 24
            }}
          >
            <Text style={{ fontSize: 10 + fontSettings.others.sizeOffset, color: colors.text, ...(otherFont.fontFamily ? { fontFamily: otherFont.fontFamily, fontWeight: otherFont.fontWeight as any } : { fontWeight: '700' }) }}>WEATHER {weatherData.temp}°C ({weatherData.location})</Text>
          </View>
        )}

        {/* Unlock Slider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: (variant === 'warmLight' || variant === 'softSage') ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.47)' }} />
          <View
            style={{
              width: 80,
              height: 36,
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              marginLeft: 8,
              overflow: 'hidden',
              justifyContent: 'center'
            }}
          >
            {/* Proportional Battery Fill */}
            <View
              style={{
                position: 'absolute',
                left: 2,
                top: 2,
                bottom: 2,
                width: `${pct - 4}%`,
                backgroundColor: colors.accent,
                borderRadius: 6
              }}
            />
            {/* Text overlay */}
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold', textAlign: 'center', zIndex: 10 }}>
              {charging ? `⚡ ${pct}%` : `${pct}%`}
            </Text>
          </View>
          <View style={{ width: 6, height: 20, backgroundColor: colors.text3, borderRadius: 3, marginLeft: 8 }} />
        </View>

        {/* Goal */}
        <Text style={{ fontSize: 11, color: colors.text2, fontWeight: '600' }}>
          Current Goal: <Text style={{ color: colors.text }}>Make memories.</Text>
        </Text>
      </View>
    </>
  );

  if (isFullScreen) {
    return <View style={containerStyle}>{renderContent()}</View>;
  }

  return (
    <View className="items-center">
      <View style={containerStyle}>{renderContent()}</View>
    </View>
  );
}
