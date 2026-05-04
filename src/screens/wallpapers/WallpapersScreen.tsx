import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

interface Wallpaper { id: string; name: string; color: string; color2: string; }

const BUILT_INS: Wallpaper[] = [
  { id: 'forest', name: 'Forest', color: '#0f1f14', color2: '#1a3a20' },
  { id: 'night', name: 'Night Sky', color: '#0a0a1a', color2: '#1a1a3a' },
  { id: 'dawn', name: 'Dawn', color: '#1a0f0a', color2: '#3a2010' },
  { id: 'arctic', name: 'Arctic', color: '#0a1a2a', color2: '#1a3a4a' },
  { id: 'moss', name: 'Moss', color: '#141f14', color2: '#2a3a2a' },
  { id: 'dusk', name: 'Dusk', color: '#1a0a1a', color2: '#3a1a3a' },
];

export function WallpapersScreen() {
  const { colors } = useTheme();
  const [active, setActive] = useState('forest');

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <TopBar title="Wallpapers" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 }} showsVerticalScrollIndicator={false}>

        <TouchableOpacity
          className="rounded-2xl border-dashed border p-7 items-center mb-6"
          style={{ backgroundColor: colors.bg2, borderColor: colors.border }}
        >
          <Text className="text-[32px] mb-2" style={{ color: colors.text3 }}>+</Text>
          <Text className="text-[15px] font-semibold" style={{ color: colors.text2 }}>Upload Custom</Text>
          <Text className="text-xs mt-1" style={{ color: colors.text3 }}>JPG or PNG</Text>
        </TouchableOpacity>

        <Text className="text-[11px] font-bold tracking-[1.2px] mb-3.5" style={{ color: colors.text3 }}>BUILT-IN THEMES</Text>

        <View className="flex-row flex-wrap gap-2.5">
          {BUILT_INS.map((w) => {
            const isActive = active === w.id;
            return (
              <TouchableOpacity
                key={w.id}
                onPress={() => setActive(w.id)}
                className="rounded-[14px] overflow-hidden"
                style={{ width: CARD_W, borderWidth: isActive ? 2 : 1, borderColor: isActive ? colors.accent : colors.border }}
              >
                <View style={{ height: CARD_W * 1.3, backgroundColor: w.color }}>
                  <View className="absolute bottom-0 left-0 right-0 h-[60%] opacity-60" style={{ backgroundColor: w.color2 }} />
                  {isActive && (
                    <View className="absolute top-2 right-2 w-6 h-6 rounded-full justify-center items-center" style={{ backgroundColor: colors.accent }}>
                      <Text className="text-xs font-bold text-black">✓</Text>
                    </View>
                  )}
                </View>
                <View className="px-2.5 py-2" style={{ backgroundColor: colors.bg2 }}>
                  <Text className="text-[13px] font-semibold" style={{ color: isActive ? colors.accent : colors.text }}>{w.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
