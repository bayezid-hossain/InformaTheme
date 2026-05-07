import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { addYears, differenceInDays, format } from 'date-fns';
import { Cake, Flame, Heart, Hourglass, Image as ImageIcon, LayoutGrid, Lock, Moon, Palette, Settings, Star, Sun, Unlock, History, Archive } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDates } from '../../context/DateStoreContext';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { useOverlay } from '../../hooks/useOverlay';
import { useTheme } from '../../hooks/useTheme';
import { useWidgetStore } from '../../hooks/useWidgetStore';

const TYPE_COLOR: Record<string, string> = {
  todo: '#60A5FA',
  birthday: '#4ADE80',
  anniversary: '#F472B6',
  milestone: '#FBBF24',
};

function getTypeIcon(type: string, color: string) {
  switch (type) {
    case 'todo': return <Hourglass size={20} color={color} />;
    case 'birthday': return <Cake size={20} color={color} />;
    case 'anniversary': return <Heart size={20} color={color} />;
    case 'milestone': return <Star size={20} color={color} />;
    default: return <Star size={20} color={color} />;
  }
}

function greet() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function GreetIcon({ color }: { color: string }) {
  const h = new Date().getHours();
  return h < 12 ? <Sun size={14} color={color} /> : h < 17 ? <Flame size={14} color={color} /> : <Moon size={14} color={color} />;
}

function daysUntilNext(dateISO: string, type: string): number | null {
  if (type === 'milestone') return null;
  const origin = new Date(dateISO);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), origin.getMonth(), origin.getDate());
  const next = thisYear <= now ? addYears(thisYear, 1) : thisYear;
  return differenceInDays(next, now);
}

function getCountdownBreakdown(dateISO: string, type: string) {
  if (type === 'milestone') return null;
  const origin = new Date(dateISO);
  const now = new Date();

  // Normalize both dates to midnight to prevent timezone or mid-day calculation mismatches
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = new Date(nowMidnight.getFullYear(), origin.getMonth(), origin.getDate());
  if (next <= nowMidnight) {
    next.setFullYear(nowMidnight.getFullYear() + 1);
  }

  const totalDays = differenceInDays(next, nowMidnight);

  let nextMonths = next.getMonth() - nowMidnight.getMonth();
  let nextDays = next.getDate() - nowMidnight.getDate();

  if (nextDays < 0) {
    nextMonths--;
    const prevMonthDate = new Date(next.getFullYear(), next.getMonth(), 0);
    nextDays += prevMonthDate.getDate();
  }
  if (nextMonths < 0) {
    nextMonths += 12;
  }

  return { months: nextMonths, days: nextDays, totalDays };
}

function liveAgeShort(dateISO: string) {
  try {
    const date = new Date(dateISO);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (_: any) {
    return dateISO;
  }
}

function getTodoRemainingTime(dateISO: string) {
  try {
    const target = new Date(dateISO);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) return 'Expired';
    
    let years = target.getFullYear() - now.getFullYear();
    let months = target.getMonth() - now.getMonth();
    let days = target.getDate() - now.getDate();
    let hours = target.getHours() - now.getHours();
    let mins = target.getMinutes() - now.getMinutes();

    if (mins < 0) {
      hours--;
      mins += 60;
    }
    if (hours < 0) {
      days--;
      hours += 24;
    }
    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMonths = years * 12 + months;

    const parts: string[] = [];
    if (totalMonths > 0) parts.push(`${totalMonths}mo`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);

    return parts.join(' ') || '0m';
  } catch (e) {
    return '0m';
  }
}

export function HomeScreen() {
  const { colors, variant, setVariant, selectedWallpaper, customWallpaper } = useTheme();
  const navigation = useNavigation<any>();
  const isKeyboardVisible = useKeyboardVisible();
  const kbBehavior = isKeyboardVisible ? 'padding' : undefined;
  const { dates, addDate } = useDates();
  const overlay = useOverlay();
  const { widgets } = useWidgetStore();

  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [dateValue, setDateValue] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [newType, setNewType] = useState<'birthday' | 'anniversary' | 'milestone' | 'todo'>('todo');
  const [showTimePicker, setShowTimePicker] = useState(false);

  function handleSave() {
    if (!newLabel.trim()) return;
    if (newType === 'todo' && dateValue < new Date()) {
      alert('A to-do cannot be scheduled in the past. Please select a future date and time.');
      return;
    }
    addDate(newLabel.trim(), dateValue.toISOString(), newType);
    setNewLabel('');
    setDateValue(new Date());
    setShowAdd(false);
  }

  const sortedDates = [...dates].sort((a, b) => {
    if (a.type === 'milestone' && b.type === 'milestone') {
      const daysA = differenceInDays(new Date(), new Date(a.dateISO));
      const daysB = differenceInDays(new Date(), new Date(b.dateISO));
      return daysA - daysB; // smallest days elapsed (most recent) first
    }
    if (a.type === 'milestone') return 1;
    if (b.type === 'milestone') return -1;

    const daysA = daysUntilNext(a.dateISO, a.type) ?? 999;
    const daysB = daysUntilNext(b.dateISO, b.type) ?? 999;
    return daysA - daysB; // closest upcoming first
  });

  const previewDates = sortedDates.slice(0, 3);
  const themeName = variant.charAt(0).toUpperCase() + variant.slice(1).replace(/([A-Z])/g, ' $1');
  const themeColors = [colors.accent, colors.bg, colors.bg1, colors.bg2];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="flex-row items-center px-5 pt-5 pb-3 gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm" style={{ color: colors.text2 }}>
                {greet()}
              </Text>
              <GreetIcon color={colors.text2} />
            </View>
            <Text className="text-[28px] font-extrabold leading-8 mt-0.5" style={{ color: colors.text }}>
              Your Timeline
            </Text>
          </View>
        </View>

        {/* Lockscreen Overlay Toggle */}
        <View className="mx-5 mb-5 rounded-2xl overflow-hidden" style={{ backgroundColor: overlay.active ? colors.accentDim : colors.bg2, borderWidth: 1, borderColor: overlay.active ? colors.accentDim : colors.border }}>
          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: overlay.active ? colors.accentDim : 'rgba(255,255,255,0.06)' }}>
                  {overlay.active ? <Lock size={20} color={colors.accent} /> : <Unlock size={20} color={colors.text} />}
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold" style={{ color: colors.text }}>Lockscreen Overlay</Text>
                  <Text className="text-[11px] mt-0.5" style={{ color: overlay.active ? colors.accent : colors.text3 }}>
                    {overlay.active ? 'Active — showing on lockscreen' : 'Tap to enable'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const wpOverride = customWallpaper ? customWallpaper.uri : (selectedWallpaper ? selectedWallpaper : undefined);
                  const wpFilter = customWallpaper ? customWallpaper.filter : undefined;

                  let finalWp = wpOverride;
                  if (wpOverride && !wpOverride.startsWith('file://') && !wpOverride.startsWith('content://') && !wpOverride.startsWith('/')) {
                    finalWp = `wp_${wpOverride.replace(/([A-Z])/g, '_$1').toLowerCase()}`;
                  }

                  overlay.toggle(variant, colors, dates, finalWp, wpFilter);
                }}
                className="w-12 h-[28px] rounded-full justify-center"
                style={{ backgroundColor: overlay.active ? colors.accent : colors.bg3 }}
              >
                <View
                  className="w-[24px] h-[24px] rounded-full"
                  style={{ transform: [{ translateX: overlay.active ? 22 : 2 }], backgroundColor: overlay.active ? colors.bg : colors.text3 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Active Theme card */}
        <View className="mx-5 mb-5 rounded-2xl overflow-hidden" style={{ backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border }}>
          <View className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-[10px] font-bold tracking-[1.5px] mb-1" style={{ color: colors.accent }}>
                  ACTIVE THEME
                </Text>
                <Text className="text-[22px] font-extrabold" style={{ color: colors.text }}>{themeName}</Text>
                <Text className="text-xs mt-1" style={{ color: colors.text3 }}>Tap to view all</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Theme')}
                className="px-4 py-2 rounded-xl"
                style={{ backgroundColor: colors.accent }}
              >
                <Text className="text-sm font-bold" style={{ color: colors.bg }}>Change</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row gap-2">
                {themeColors.map((c, i) => (
                  <View key={i} className="w-7 h-7 rounded-lg" style={{ backgroundColor: c }} />
                ))}
              </View>
              <Text className="text-[11px] font-mono" style={{ color: colors.text3 }}>
                {widgets.filter(w => w.enabled).length} widgets active
              </Text>
            </View>
          </View>
        </View>

        {/* Anchor Dates */}
        <View className="px-5 mb-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[17px] font-bold" style={{ color: colors.text }}>Anchor Dates</Text>
          </View>

          {previewDates.length === 0 ? (
            <View
              className="rounded-2xl p-6 border items-center justify-center mb-3"
              style={{ backgroundColor: colors.bg2, borderColor: colors.border }}
            >
              <Text className="text-[13px] text-center" style={{ color: colors.text3 }}>
                No anchor dates added yet. Tap '+ Add Date' below to begin tracking milestones!
              </Text>
            </View>
          ) : (
            <View>
              {previewDates.map((d) => {
                const typeColor = TYPE_COLOR[d.type] ?? colors.accent;
                const countdown = getCountdownBreakdown(d.dateISO, d.type);
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
                      {getTypeIcon(d.type, typeColor)}
                    </View>
                    {/* Label + age */}
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold" style={{ color: colors.text }}>{d.label}</Text>
                      <Text className="text-xs mt-0.5" style={{ color: colors.text3 }}>
                        {d.type === 'todo' 
                          ? `Target: ${new Date(d.dateISO).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date(d.dateISO).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                          : liveAgeShort(d.dateISO)}
                      </Text>
                    </View>
                    {/* Days left breakdown */}
                    {d.type === 'todo' ? (
                      <View className="items-end justify-center">
                        <Text className="text-[14px] font-extrabold" style={{ color: typeColor }}>
                          {getTodoRemainingTime(d.dateISO)}
                        </Text>
                        <Text className="text-[9px] font-bold mt-1" style={{ color: colors.text3 }}>
                          remaining
                        </Text>
                      </View>
                    ) : (
                      countdown !== null && (
                        <View className="items-end justify-center">
                          <Text className="text-[20px] font-extrabold leading-none" style={{ color: typeColor }}>
                            {countdown.totalDays}d
                          </Text>
                          <Text className="text-[10px] font-bold mt-1" style={{ color: colors.text2 }}>
                            {countdown.months > 0 ? `${countdown.months}m ` : ''}{countdown.days}d left
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Premium Bottom Action Row */}
          <View className="flex-row items-center gap-3 mt-1">
            <TouchableOpacity
              onPress={() => {
                setNewLabel('');
                setDateValue(new Date());
                setNewType('birthday');
                setShowAdd(true);
              }}
              className="flex-1 h-11 rounded-xl flex-row items-center justify-center gap-1.5 border"
              style={{ backgroundColor: `${colors.accent}08`, borderColor: `${colors.accent}25` }}
            >
              <Text className="text-sm font-bold" style={{ color: colors.accent }}>+ Add Date</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Dates')}
              className="flex-1 h-11 rounded-xl flex-row items-center justify-center gap-1.5 border"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: colors.border }}
            >
              <Text className="text-sm font-bold" style={{ color: colors.text2 }}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* History Button - Next Row */}
          <TouchableOpacity
            onPress={() => navigation.navigate('History')}
            className="w-full h-12 rounded-xl flex-row items-center justify-between px-4 border mt-2.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: colors.border }}
          >
            <View className="flex-row items-center gap-2.5">
              <View className="w-7 h-7 rounded-lg items-center justify-center" style={{ backgroundColor: `${colors.accent}15` }}>
                <Archive size={15} color={colors.accent} />
              </View>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>History & Archive</Text>
            </View>
            <History size={15} color={colors.text3} />
          </TouchableOpacity>
        </View>

        <View className="px-5 mt-4 mb-4">
          <Text className="text-[17px] font-bold mb-3" style={{ color: colors.text }}>Quick Actions</Text>
          <View className="flex-row flex-wrap gap-3">
            {[
              { label: 'Themes', icon: <Palette size={22} color="#A78BFA" />, screen: 'Theme', bg: 'rgba(167,139,250,0.12)' },
              { label: 'Widgets', icon: <LayoutGrid size={22} color="#60A5FA" />, screen: 'Widgets', bg: 'rgba(96,165,250,0.12)' },
              { label: 'Wallpapers', icon: <ImageIcon size={22} color="#FB923C" />, screen: 'Wallpapers', bg: 'rgba(251,146,60,0.12)' },
              { label: 'Settings', icon: <Settings size={22} color="#94A3B8" />, screen: 'Settings', bg: 'rgba(148,163,184,0.10)' },
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
                  {a.icon}
                </View>
                <Text className="text-[14px] font-semibold" style={{ color: colors.text }}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? kbBehavior : kbBehavior}
          className="flex-1"
        >
          <View className="flex-1 justify-end">
            {/* Backdrop */}
            <TouchableOpacity
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
              activeOpacity={1}
              onPress={() => setShowAdd(false)}
            />
            {/* Sheet */}
            <View className="rounded-t-3xl border-t" style={{ backgroundColor: colors.bg1, borderTopColor: colors.border }}>
              <View className="w-10 h-1 rounded-full self-center mt-3 mb-1" style={{ backgroundColor: colors.border }} />
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingBottom: 32 }}>
                <Text className="text-lg font-bold mb-5" style={{ color: colors.text }}>Add Anchor Date</Text>

                <Text className="text-xs mb-1.5" style={{ color: colors.text3 }}>Label</Text>
                <TextInput
                  value={newLabel} onChangeText={setNewLabel}
                  placeholder="e.g. Luka's Birthday" placeholderTextColor={colors.text3}
                  returnKeyType="done"
                  className="rounded-xl border px-3.5 py-3 text-[15px] mb-4"
                  style={{ backgroundColor: colors.bg2, borderColor: colors.border, color: colors.text }}
                />

                <Text className="text-xs mb-1.5" style={{ color: colors.text3 }}>Date</Text>
                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  className="rounded-xl border px-3.5 py-3 mb-1 justify-center"
                  style={{ backgroundColor: colors.bg2, borderColor: colors.border }}
                >
                  <Text style={{ color: colors.text, fontSize: 15 }}>{format(dateValue, 'MMMM d, yyyy')}</Text>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={dateValue}
                    mode="date"
                    display="default"
                    onChange={(_, selectedDate) => {
                      setShowPicker(false);
                      if (selectedDate) {
                        const updated = new Date(dateValue);
                        updated.setFullYear(selectedDate.getFullYear());
                        updated.setMonth(selectedDate.getMonth());
                        updated.setDate(selectedDate.getDate());
                        
                        if (newType === 'todo' && updated < new Date()) {
                          alert('A to-do cannot be scheduled in the past. Automatically adjusting to current time.');
                          setDateValue(new Date());
                        } else {
                          setDateValue(updated);
                          if (selectedDate > new Date()) {
                            setNewType('todo');
                          }
                        }
                      }
                    }}
                  />
                )}

                {newType === 'todo' && (
                  <>
                    <Text className="text-xs mb-1.5 mt-3" style={{ color: colors.text3 }}>Time</Text>
                    <TouchableOpacity
                      onPress={() => setShowTimePicker(true)}
                      className="rounded-xl border px-3.5 py-3 mb-1 justify-center"
                      style={{ backgroundColor: colors.bg2, borderColor: colors.border }}
                    >
                      <Text style={{ color: colors.text, fontSize: 15 }}>{format(dateValue, 'h:mm a')}</Text>
                    </TouchableOpacity>

                    {showTimePicker && (
                      <DateTimePicker
                        value={dateValue}
                        mode="time"
                        display="default"
                        onChange={(_, selectedTime) => {
                          setShowTimePicker(false);
                          if (selectedTime) {
                            const updated = new Date(dateValue);
                            updated.setHours(selectedTime.getHours());
                            updated.setMinutes(selectedTime.getMinutes());
                            updated.setSeconds(0);
                            updated.setMilliseconds(0);
                            
                            if (updated < new Date()) {
                              alert('A to-do cannot be scheduled in the past. Automatically adjusting to current time.');
                              setDateValue(new Date());
                            } else {
                              setDateValue(updated);
                            }
                          }
                        }}
                      />
                    )}
                  </>
                )}

                <View className="mb-4" />

                <Text className="text-xs mb-1.5" style={{ color: colors.text3 }}>Type</Text>
                <View className="flex-row gap-2 mb-6">
                  {(['todo', 'birthday', 'anniversary', 'milestone'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setNewType(t)}
                      className="flex-1 py-2.5 rounded-xl border items-center justify-center flex-row gap-1"
                      style={{ borderColor: newType === t ? colors.accent : colors.border, backgroundColor: newType === t ? `${colors.accent}15` : 'transparent' }}
                    >
                      {t === 'todo' && <Hourglass size={14} color={newType === t ? colors.accent : colors.text3} />}
                      {t === 'birthday' && <Cake size={14} color={newType === t ? colors.accent : colors.text3} />}
                      {t === 'anniversary' && <Heart size={14} color={newType === t ? colors.accent : colors.text3} />}
                      {t === 'milestone' && <Star size={14} color={newType === t ? colors.accent : colors.text3} />}
                      <Text className="text-[11px] font-medium" style={{ color: newType === t ? colors.accent : colors.text3 }}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={handleSave} className="h-[52px] rounded-[14px] justify-center items-center" style={{ backgroundColor: colors.accent }}>
                  <Text className="text-base font-bold text-black">Add Date</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
