import DateTimePicker from '@react-native-community/datetimepicker';
import { differenceInDays, differenceInMonths, differenceInYears, format } from 'date-fns';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { useDates } from '../../context/DateStoreContext';
import { useAlert } from '../../hooks/useAlert';
import { DateType } from '../../hooks/useDateStore';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { useTheme } from '../../hooks/useTheme';
import { Calendar as CalendarIcon, Cake, Heart, Star, Trash2, Hourglass } from 'lucide-react-native';

const TYPE_FILTERS = ['All', 'Todo', 'Birthday', 'Anniversary', 'Milestone'] as const;
const TYPE_ICONS: Record<DateType, React.ReactElement> = { 
  todo: <Hourglass size={14} />,
  birthday: <Cake size={14} />, 
  anniversary: <Heart size={14} />, 
  milestone: <Star size={14} /> 
};
const TYPE_COLOR: Record<DateType, string> = { todo: '#60A5FA', birthday: '#4ADE80', anniversary: '#F472B6', milestone: '#FBBF24' };

function liveAge(dateISO: string) {
  const date = new Date(dateISO);
  const now = new Date();
  const years = differenceInYears(now, date);
  const months = differenceInMonths(now, date) % 12;
  const days = differenceInDays(
    now,
    new Date(date.getFullYear() + years, date.getMonth() + months, date.getDate()),
  );
  return `${years}y ${months}m ${days}d`;
}

function getRemainingTime(dateISO: string) {
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

export function DatesScreen() {
  const { colors } = useTheme();
  const { showAlert } = useAlert();
  const { dates, addDate, deleteDate, updateDate, persist } = useDates();
  const isKeyboardVisible = useKeyboardVisible();
  const [filter, setFilter] = useState<typeof TYPE_FILTERS[number]>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [dateValue, setDateValue] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [newType, setNewType] = useState<DateType>('todo');
  const [showTimePicker, setShowTimePicker] = useState(false);
 
  const filtered = filter === 'All' ? dates : dates.filter((d) => d.type === (filter.toLowerCase() as DateType));
 
  function handleSave() {
    if (!newLabel.trim()) return;
    if (newType === 'todo' && dateValue < new Date()) {
      alert('A to-do cannot be scheduled in the past. Please select a future date and time.');
      return;
    }
    if (editingDateId) {
      updateDate(editingDateId, {
        label: newLabel.trim(),
        dateISO: dateValue.toISOString(),
        type: newType,
      });
    } else {
      addDate(newLabel.trim(), dateValue.toISOString(), newType);
    }
    setNewLabel('');
    setDateValue(new Date());
    setEditingDateId(null);
    setShowAdd(false);
  }

  function handleStartEdit(d: any) {
    setEditingDateId(d.id);
    setNewLabel(d.label);
    setDateValue(new Date(d.dateISO));
    setNewType(d.type);
    setShowAdd(true);
  }

  function handleStartAdd() {
    setEditingDateId(null);
    setNewLabel('');
    setDateValue(new Date());
    setNewType('todo');
    setShowAdd(true);
  }

  function confirmDelete(id: string, label: string) {
    showAlert('Delete Anchor', `Are you sure you want to remove "${label}"? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDate(id) },
    ]);
  }

  function confirmDeleteAll() {
    showAlert('Delete All Anchors', 'Are you sure you want to remove ALL your anchor dates? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: () => persist([]) },
    ]);
  }

  // Only apply keyboard avoiding when keyboard is visible — prevents snappy close animation
  const kbBehavior = isKeyboardVisible ? 'padding' : undefined;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <TopBar
        title="Anchor Dates"
        rightElement={
          <View className="flex-row items-center gap-4">
            {dates.length > 0 && (
              <TouchableOpacity onPress={confirmDeleteAll} style={{ padding: 4 }}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleStartAdd} style={{ padding: 4 }}>
              <Text className="text-[26px] font-light leading-7" style={{ color: colors.accent }}>+</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0" contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: 'row' }}>
        {TYPE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className="px-3.5 py-[7px] rounded-full border"
            style={{ borderColor: filter === f ? colors.accent : colors.border, backgroundColor: filter === f ? colors.accentDim : 'transparent' }}
          >
            <Text className="text-[13px] font-medium" style={{ color: filter === f ? colors.accent : colors.text3 }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View className="items-center py-16">
            <View className="mb-3">
              <CalendarIcon size={48} color={colors.text3} />
            </View>
            <Text className="text-[15px] font-medium mb-1" style={{ color: colors.text }}>No dates yet</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>Tap + to add an anchor date</Text>
          </View>
        )}
        {filtered.map((d) => {
          const date = new Date(d.dateISO);
          const daysSince = differenceInDays(new Date(), date);
          const typeColor = TYPE_COLOR[d.type];
          return (
            <View key={d.id} className="rounded-2xl p-4 border mb-3" style={{ backgroundColor: colors.bg2, borderColor: colors.border }}>
              <View className="flex-row items-center gap-3 mb-3.5">
                <View className="w-11 h-11 rounded-[10px] items-center justify-center" style={{ backgroundColor: `${typeColor}20` }}>
                  {React.cloneElement(TYPE_ICONS[d.type] as React.ReactElement<any>, { size: 24, color: typeColor })}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>{d.label}</Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.text3 }}>
                    {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="px-2 py-[3px] rounded-lg" style={{ backgroundColor: `${typeColor}20` }}>
                    <Text className="text-[11px] font-semibold" style={{ color: typeColor }}>{d.type}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleStartEdit(d)} className="w-7 h-7 items-center justify-center rounded-full mr-1" style={{ backgroundColor: `${colors.accent}15` }}>
                    <Text className="text-[11px]" style={{ color: colors.accent }}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(d.id, d.label)} className="w-7 h-7 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                    <Text className="text-[13px]" style={{ color: '#ef4444' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row border-t pt-3" style={{ borderTopColor: colors.border }}>
                {d.type === 'todo' ? (
                  <>
                    <View className="flex-1 items-center">
                      <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        {format(new Date(d.dateISO), 'h:mm a')}
                      </Text>
                      <Text className="text-[11px] mt-0.5" style={{ color: colors.text3 }}>target time</Text>
                    </View>
                    <View className="w-px mx-3" style={{ backgroundColor: colors.border }} />
                    <View className="flex-1 items-center">
                      <Text className="text-lg font-bold" style={{ color: colors.accent }}>
                        {getRemainingTime(d.dateISO)}
                      </Text>
                      <Text className="text-[11px] mt-0.5" style={{ color: colors.text3 }}>remaining time</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View className="flex-1 items-center">
                      <Text className="text-lg font-bold" style={{ color: colors.text }}>{daysSince.toLocaleString()}</Text>
                      <Text className="text-[11px] mt-0.5" style={{ color: colors.text3 }}>days since</Text>
                    </View>
                    <View className="w-px mx-3" style={{ backgroundColor: colors.border }} />
                    <View className="flex-1 items-center">
                      <Text className="text-lg font-bold" style={{ color: colors.text }}>{liveAge(d.dateISO)}</Text>
                      <Text className="text-[11px] mt-0.5" style={{ color: colors.text3 }}>
                        {d.type === 'birthday' ? 'age' : d.type === 'anniversary' ? 'anniversary' : 'elapsed'}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          );
        })}
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
                <Text className="text-lg font-bold mb-5" style={{ color: colors.text }}>{editingDateId ? 'Edit Anchor Date' : 'Add Anchor Date'}</Text>

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
                    onChange={(event, selectedDate) => {
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
                        onChange={(event, selectedTime) => {
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
                  {(['todo', 'birthday', 'anniversary', 'milestone'] as DateType[]).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setNewType(t)}
                      className="flex-1 py-2.5 rounded-xl border items-center justify-center flex-row gap-1"
                      style={{ borderColor: newType === t ? colors.accent : colors.border, backgroundColor: newType === t ? colors.accentDim : 'transparent' }}
                    >
                      {React.cloneElement(TYPE_ICONS[t] as React.ReactElement<any>, { color: newType === t ? colors.accent : colors.text3 })}
                      <Text className="text-[11px] font-medium" style={{ color: newType === t ? colors.accent : colors.text3 }}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={handleSave} className="h-[52px] rounded-[14px] justify-center items-center" style={{ backgroundColor: colors.accent }}>
                  <Text className="text-base font-bold text-black">{editingDateId ? 'Save Changes' : 'Add Date'}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
