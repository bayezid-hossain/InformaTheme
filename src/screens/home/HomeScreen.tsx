import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useDates } from '../../context/DateStoreContext';
import { useOverlay } from '../../hooks/useOverlay';
import { differenceInDays, addYears } from 'date-fns';

const TYPE_COLOR: Record<string, string> = {
  birthday: '#4ADE80',
  anniversary: '#F472B6',
  milestone: '#FBBF24',
};

function greet() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function greetEmoji() {
  const h = new Date().getHours();
  return h < 12 ? '☀️' : h < 17 ? '🔥' : '🌙';
}

function daysUntilNext(dateISO: string, type: string): number | null {
  if (type === 'milestone') return null;
  const origin = new Date(dateISO);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), origin.getMonth(), origin.getDate());
  const next = thisYear <= now ? addYears(thisYear, 1) : thisYear;
  return differenceInDays(next, now);
}

function liveAgeShort(dateISO: string) {
  const date = new Date(dateISO);
  const now = new Date();
  const days = differenceInDays(now, date);
  return `${days} days ago`;
}

export function HomeScreen() {
  const { colors, variant, setVariant } = useTheme();
  const navigation = useNavigation<any>();
  const { dates } = useDates();
  const overlay = useOverlay();

  const previewDates = dates.slice(0, 3);
  const themeName = variant === 'darkPremium' ? 'Dark Premium' : variant === 'warmLight' ? 'Warm Light' : 'Glassmorphism';
  const themeColors = [colors.accent, colors.bg2, colors.bg3, colors.text2];

  // Sync data to native whenever theme or dates change
  useEffect(() => {
    overlay.syncData(colors, dates);
  }, [colors, dates]);


  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="flex-row items-center px-5 pt-5 pb-3 gap-3">
          <View className="flex-1">
            <Text className="text-sm" style={{ color: colors.text2 }}>
              {greet()} {greetEmoji()}
            </Text>
            <Text className="text-[28px] font-extrabold leading-8 mt-0.5" style={{ color: colors.text }}>
              Your Timeline
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full border items-center justify-center"
            style={{ backgroundColor: colors.bg2, borderColor: colors.border }}
          >
            <Text className="text-lg">🔔</Text>
          </TouchableOpacity>
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="text-base font-bold" style={{ color: '#000' }}>J</Text>
          </View>
        </View>

        {/* Lockscreen Overlay Toggle */}
        <View className="mx-5 mb-5 rounded-2xl overflow-hidden" style={{ backgroundColor: overlay.active ? 'rgba(74,222,128,0.06)' : colors.bg2, borderWidth: 1, borderColor: overlay.active ? 'rgba(74,222,128,0.25)' : colors.border }}>
          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: overlay.active ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)' }}>
                  <Text className="text-xl">{overlay.active ? '🔒' : '🔓'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold" style={{ color: colors.text }}>Lockscreen Overlay</Text>
                  <Text className="text-[11px] mt-0.5" style={{ color: overlay.active ? colors.accent : colors.text3 }}>
                    {overlay.active ? 'Active — showing on lockscreen' : 'Tap to enable'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => overlay.toggle(colors, dates)}
                className="w-12 h-[28px] rounded-full justify-center"
                style={{ backgroundColor: overlay.active ? colors.accent : colors.bg3 }}
              >
                <View
                  className="w-[24px] h-[24px] rounded-full"
                  style={{ transform: [{ translateX: overlay.active ? 22 : 2 }], backgroundColor: overlay.active ? '#000' : colors.text3 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Active Theme card */}
        <View className="mx-5 mb-5 rounded-2xl overflow-hidden" style={{ backgroundColor: '#0d2818', borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)' }}>
          <View className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-[10px] font-bold tracking-[1.5px] mb-1" style={{ color: colors.accent }}>
                  ACTIVE THEME
                </Text>
                <Text className="text-[22px] font-extrabold" style={{ color: '#e8ecf2' }}>{themeName}</Text>
                <Text className="text-xs mt-1" style={{ color: '#4a5568' }}>Last updated today</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                className="px-4 py-2 rounded-xl"
                style={{ backgroundColor: colors.accent }}
              >
                <Text className="text-sm font-bold" style={{ color: '#000' }}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row gap-2">
                {themeColors.map((c, i) => (
                  <View key={i} className="w-7 h-7 rounded-lg" style={{ backgroundColor: c }} />
                ))}
              </View>
              <Text className="text-[11px] font-mono" style={{ color: '#4a5568' }}>
                {dates.length + 4} widgets active
              </Text>
            </View>
          </View>
        </View>

        {/* Anchor Dates */}
        <View className="px-5 mb-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[17px] font-bold" style={{ color: colors.text }}>Anchor Dates</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dates')}>
              <Text className="text-[14px] font-semibold" style={{ color: colors.accent }}>See all</Text>
            </TouchableOpacity>
          </View>

          {previewDates.length === 0 ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('Dates')}
              className="flex-row items-center rounded-2xl p-4 border gap-3"
              style={{ backgroundColor: colors.bg2, borderColor: colors.border, borderStyle: 'dashed' }}
            >
              <Text style={{ color: colors.text3, fontSize: 20 }}>+</Text>
              <Text className="text-[14px]" style={{ color: colors.text3 }}>Add anchor date</Text>
            </TouchableOpacity>
          ) : (
            <>
              {previewDates.map((d) => {
                const typeColor = TYPE_COLOR[d.type] ?? colors.accent;
                const daysLeft = daysUntilNext(d.dateISO, d.type);
                return (
                  <View
                    key={d.id}
                    className="flex-row items-center rounded-2xl p-3.5 border mb-2.5 gap-3"
                    style={{ backgroundColor: colors.bg2, borderColor: colors.border }}
                  >
                    {/* Colored icon badge */}
                    <View
                      className="w-10 h-10 rounded-[10px] items-center justify-center"
                      style={{ backgroundColor: `${typeColor}20` }}
                    >
                      <Text className="text-xl">{d.icon}</Text>
                    </View>
                    {/* Label + age */}
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold" style={{ color: colors.text }}>{d.label}</Text>
                      <Text className="text-xs mt-0.5" style={{ color: colors.text3 }}>
                        {liveAgeShort(d.dateISO)}
                      </Text>
                    </View>
                    {/* Days left */}
                    {daysLeft !== null && (
                      <View className="items-end">
                        <Text className="text-[22px] font-extrabold leading-none" style={{ color: typeColor }}>
                          {daysLeft}
                        </Text>
                        <Text className="text-[9px] font-bold tracking-wider mt-0.5" style={{ color: colors.text3 }}>
                          DAYS LEFT
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Add anchor date row */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Dates')}
                className="flex-row items-center rounded-2xl p-3.5 border gap-2"
                style={{ backgroundColor: 'transparent', borderColor: colors.border, borderStyle: 'dashed' }}
              >
                <Text className="text-lg" style={{ color: colors.text3 }}>+</Text>
                <Text className="text-[14px]" style={{ color: colors.text3 }}>Add anchor date</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-5 mt-4">
          <Text className="text-[17px] font-bold mb-3" style={{ color: colors.text }}>Quick Actions</Text>
          <View className="flex-row flex-wrap gap-3">
            {[
              { label: 'Themes', icon: '🎨', screen: 'Settings', bg: 'rgba(167,139,250,0.12)', color: '#A78BFA' },
              { label: 'Widgets', icon: '▦', screen: 'Widgets', bg: 'rgba(96,165,250,0.12)', color: '#60A5FA' },
              { label: 'Wallpapers', icon: '🖼', screen: 'Wallpapers', bg: 'rgba(251,146,60,0.12)', color: '#FB923C' },
              { label: 'Settings', icon: '⚙️', screen: 'Settings', bg: 'rgba(148,163,184,0.10)', color: '#94A3B8' },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => navigation.navigate(a.screen)}
                className="rounded-2xl p-4 border items-center justify-center gap-2"
                style={{ width: '47%', backgroundColor: colors.bg2, borderColor: colors.border, minHeight: 88 }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mb-1"
                  style={{ backgroundColor: a.bg }}
                >
                  <Text className="text-xl">{a.icon}</Text>
                </View>
                <Text className="text-[14px] font-semibold" style={{ color: colors.text }}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme switcher (compact) */}
        <View className="px-5 mt-5">
          <Text className="text-[11px] font-bold tracking-[1.2px] mb-2.5" style={{ color: colors.text3 }}>SWITCH THEME</Text>
          <View className="flex-row gap-2">
            {(['darkPremium', 'warmLight', 'glassmorphism'] as const).map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setVariant(v)}
                className="flex-1 py-2.5 rounded-xl border items-center"
                style={{ borderColor: variant === v ? colors.accent : colors.border, backgroundColor: variant === v ? colors.accentDim : 'transparent' }}
              >
                <Text className="text-[12px] font-semibold" style={{ color: variant === v ? colors.accent : colors.text3 }}>
                  {v === 'darkPremium' ? 'Dark' : v === 'warmLight' ? 'Warm' : 'Glass'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
