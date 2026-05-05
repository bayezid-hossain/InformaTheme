import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { useTheme } from '../../hooks/useTheme';
import { useWidgetStore } from '../../hooks/useWidgetStore';
import { Clock, Calendar, Heart, Sprout, Cloud, Battery, Target, Hourglass } from 'lucide-react-native';

function getWidgetIcon(id: string, color: string) {
  switch (id) {
    case 'clock': return <Clock size={28} color={color} />;
    case 'milestone': return <Calendar size={28} color={color} />;
    case 'anniversary': return <Heart size={28} color={color} />;
    case 'growth': return <Sprout size={28} color={color} />;
    case 'weather': return <Cloud size={28} color={color} />;
    case 'battery': return <Battery size={28} color={color} />;
    case 'goal': return <Target size={28} color={color} />;
    case 'countdown': return <Hourglass size={28} color={color} />;
    default: return <Clock size={28} color={color} />;
  }
}

export function WidgetsScreen() {
  const { colors } = useTheme();
  const { widgets, toggle } = useWidgetStore();
  const activeCount = widgets.filter((w) => w.enabled).length;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <TopBar title="Widgets" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 }} showsVerticalScrollIndicator={false}>

        <View className="flex-row items-center rounded-[14px] p-4 border mb-5 gap-2" style={{ backgroundColor: colors.bg2, borderColor: colors.border }}>
          <Text className="text-[32px] font-bold" style={{ color: colors.accent }}>{activeCount}</Text>
          <Text className="text-sm" style={{ color: colors.text2 }}>of {widgets.length} widgets active</Text>
        </View>

        {widgets.map((w) => (
          <View key={w.id} className="flex-row items-center rounded-[14px] p-3.5 border mb-2.5 gap-3" style={{ backgroundColor: colors.bg2, borderColor: colors.border }}>
            <View className="w-10 items-center justify-center">
              {getWidgetIcon(w.id, colors.text)}
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold" style={{ color: colors.text }}>{w.name}</Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.text3 }}>{w.desc}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggle(w.id)}
              className="w-11 h-[26px] rounded-full justify-center"
              style={{ backgroundColor: w.enabled ? colors.accent : colors.bg3 }}
            >
              <View
                className="w-[22px] h-[22px] rounded-full"
                style={{ transform: [{ translateX: w.enabled ? 18 : 2 }], backgroundColor: w.enabled ? '#000' : colors.text3 }}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
