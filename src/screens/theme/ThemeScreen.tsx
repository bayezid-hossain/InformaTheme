import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, themes } from '../../hooks/useTheme';
import { ThemeVariant } from '../../theme/colors';
import { LockscreenPreview } from '../../components/LockscreenPreview';
import { ArrowLeft } from 'lucide-react-native';

const THEME_OPTIONS: { id: ThemeVariant; name: string }[] = [
  { id: 'darkPremium', name: 'Dark Premium' },
  { id: 'warmLight', name: 'Warm Light' },
  { id: 'glassmorphism', name: 'Glassmorphism' },
  { id: 'deepForest', name: 'Deep Forest' },
  { id: 'softSage', name: 'Soft Sage' },
  { id: 'midnightStars', name: 'Midnight Stars' },
  { id: 'oceanDive', name: 'Ocean Dive' },
  { id: 'warmEarth', name: 'Warm Earth' },
];

export function ThemeScreen() {
  const { colors, variant, setVariant } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = Dimensions.get('window');

  // We scale the preview down to fit the screen alongside other controls
  const previewScale = 0.6;
  const previewWidth = (width - 64) * previewScale;
  const previewHeight = previewWidth * 2.1;

  const activeThemeColors = [colors.bg, colors.bg2, colors.accent, colors.text];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-5 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 mr-2">
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>Themes</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Preview Section */}
        <View className="items-center justify-center mt-4" style={{ height: previewHeight + 40 }}>
          <View style={{ transform: [{ scale: previewScale }] }}>
            <View style={{ pointerEvents: 'none' }}>
              <LockscreenPreview />
            </View>
          </View>
        </View>

        {/* Palette Section */}
        <View className="px-5 mt-6 mb-6">
          <Text className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: colors.text2 }}>App Palette</Text>
          <View className="flex-row gap-3">
            {activeThemeColors.map((c, i) => (
              <View key={i} className="flex-1 aspect-square rounded-2xl items-center justify-center" style={{ backgroundColor: c, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: i === 2 || i === 3 ? colors.bg : colors.text, fontSize: 10, fontWeight: 'bold' }}>
                  {i === 0 ? 'BG' : i === 1 ? 'CARD' : i === 2 ? 'ACCENT' : 'TEXT'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Theme Options */}
        <View className="px-5">
          <Text className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: colors.text2 }}>Available Themes</Text>
          <View className="flex-row flex-wrap justify-between">
            {THEME_OPTIONS.map((opt) => {
              const isActive = variant === opt.id;
              const optColors = themes[opt.id];
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setVariant(opt.id)}
                  className="rounded-2xl p-4 mb-3"
                  style={{
                    width: '48%',
                    backgroundColor: isActive ? colors.accentDim : colors.bg2,
                    borderWidth: 2,
                    borderColor: isActive ? colors.accent : colors.border
                  }}
                >
                  <View className="flex-row gap-1.5 mb-2.5">
                    <View className="w-4 h-4 rounded-full border" style={{ backgroundColor: optColors.bg, borderColor: optColors.border || colors.border }} />
                    <View className="w-4 h-4 rounded-full border" style={{ backgroundColor: optColors.accent, borderColor: 'transparent' }} />
                    <View className="w-4 h-4 rounded-full border" style={{ backgroundColor: optColors.text, borderColor: 'transparent' }} />
                  </View>
                  <Text className="font-bold text-[14px]" style={{ color: isActive ? colors.accent : colors.text }}>{opt.name}</Text>
                  {optColors.tagline ? (
                    <Text className="text-[10px] mt-1" style={{ color: colors.text2 }}>{optColors.tagline}</Text>
                  ) : (
                    <Text className="text-[10px] mt-1" style={{ color: colors.text3 }}>Pre-configured</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
