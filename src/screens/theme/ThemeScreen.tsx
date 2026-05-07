import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';
import { useFontSettings, FontCategory } from '../../hooks/useFontSettings';
import { themes, useTheme } from '../../hooks/useTheme';
import { ThemeVariant } from '../../theme/colors';
import { LockscreenPreview } from '../../components/LockscreenPreview';

const THEME_OPTIONS: { id: ThemeVariant; name: string }[] = [
  { id: 'onyxGold', name: 'Onyx & Gold' },
  { id: 'darkPremium', name: 'Dark Premium' },
  { id: 'royalAmethyst', name: 'Royal Amethyst' },
  { id: 'midnightStars', name: 'Midnight Stars' },
  { id: 'roseQuartz', name: 'Rose Quartz' },
  { id: 'softSage', name: 'Soft Sage' },
  { id: 'warmLight', name: 'Warm Light' },
  { id: 'deepForest', name: 'Deep Forest' },
  { id: 'cobaltNight', name: 'Cobalt Night' },
  { id: 'oceanDive', name: 'Ocean Dive' },
  { id: 'glassmorphism', name: 'Glassmorphism' },
  { id: 'warmEarth', name: 'Warm Earth' },
];

const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: 'clock', label: 'Clock' },
  { id: 'todo', label: 'Todo' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniv.' },
  { id: 'milestone', label: 'Milestone' },
  { id: 'others', label: 'Others' },
];

const MAIN_TABS = ['Themes', 'Fonts', 'Palette'] as const;
type MainTab = typeof MAIN_TABS[number];

const { width, height } = Dimensions.get('window');
const PHONE_W = width - 64;
const PHONE_H = PHONE_W * 2.1;
const PREVIEW_H = height * 0.65;
const PREVIEW_SCALE = Math.min(PREVIEW_H / PHONE_H, (width * 0.72) / PHONE_W);

export function ThemeScreen() {
  const { colors, variant, setVariant } = useTheme();
  const { settings, setFont, setSizeOffset } = useFontSettings();
  const navigation = useNavigation<any>();

  const [mainTab, setMainTab] = useState<MainTab>('Themes');
  const [fontCategory, setFontCategory] = useState<FontCategory>('clock');

  const currentCat = settings[fontCategory];
  const activeThemeColors = [colors.bg, colors.bg2, colors.accent, colors.text];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginLeft: -6, marginRight: 8 }}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Themes & Fonts</Text>
      </View>

      {/* Preview — always visible */}
      <View style={{ height: PREVIEW_H, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <View style={{ transform: [{ scale: PREVIEW_SCALE }], transformOrigin: 'center' }}>
          <View style={{ pointerEvents: 'none' }}>
            <LockscreenPreview />
          </View>
        </View>
      </View>

      {/* Main Tab Bar */}
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.bg2, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
          {MAIN_TABS.map(tab => {
            const isActive = mainTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setMainTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  borderRadius: 10,
                  backgroundColor: isActive ? colors.accent : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: isActive ? colors.bg : colors.text3 }}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1, overflow: 'hidden', paddingTop: 10 }}>

        {/* ── THEMES ── */}
        {mainTab === 'Themes' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4, alignItems: 'flex-start' }}
          >
            {THEME_OPTIONS.map(opt => {
              const isActive = variant === opt.id;
              const optColors = themes[opt.id];
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setVariant(opt.id)}
                  style={{
                    width: 96,
                    height: 74,
                    borderRadius: 14,
                    padding: 8,
                    backgroundColor: isActive ? colors.accentDim : colors.bg2,
                    borderWidth: 1.5,
                    borderColor: isActive ? colors.accent : colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: optColors.bg, borderWidth: 1, borderColor: optColors.border || colors.border }} />
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: optColors.accent }} />
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: optColors.text }} />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isActive ? colors.accent : colors.text }} numberOfLines={1}>
                    {opt.name}
                  </Text>
                  {optColors.tagline ? (
                    <Text style={{ fontSize: 8, color: colors.text2, marginTop: 1 }} numberOfLines={1}>{optColors.tagline}</Text>
                  ) : (
                    <Text style={{ fontSize: 8, color: colors.text3, marginTop: 1 }}>Pre-configured</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── FONTS ── */}
        {mainTab === 'Fonts' && (
          <View style={{ paddingHorizontal: 20, gap: 6 }}>

            {/* Category row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ height: 28, flexGrow: 0 }}
              contentContainerStyle={{ gap: 6, alignItems: 'flex-start' }}
            >
              {FONT_CATEGORIES.map(cat => {
                const isActive = fontCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setFontCategory(cat.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 14,
                      backgroundColor: isActive ? colors.accentDim : 'transparent',
                      borderWidth: 1,
                      borderColor: isActive ? colors.accent : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: isActive ? colors.accent : colors.text2 }}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Font picker */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ height: 76, flexGrow: 0 }}
              contentContainerStyle={{ gap: 8, paddingBottom: 2, paddingRight: 2 }}
            >
              {FONTS.map(font => {
                const isActive = currentCat.fontId === font.id;
                return (
                  <TouchableOpacity
                    key={font.id}
                    onPress={() => setFont(fontCategory, font.id)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isActive ? colors.accent : colors.border,
                      backgroundColor: isActive ? colors.accentDim : colors.bg2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 6,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={{
                        fontFamily: font.fontFamily,
                        fontWeight: font.fontWeight as any,
                        fontSize: 18,
                        color: isActive ? colors.accent : colors.text,
                        letterSpacing: font.clockTracking * 0.2,
                      }}
                    >
                      {fontCategory === 'clock' ? '12:34' : 'Abc'}
                    </Text>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: isActive ? colors.accent : colors.text3, marginTop: 4, textAlign: 'center' }}>
                      {font.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Size stepper */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text2, marginRight: 2 }}>Size:</Text>
              <TouchableOpacity
                onPress={() => setSizeOffset(fontCategory, currentCat.sizeOffset - 1)}
                style={{ width: 32, height: 28, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginTop: -2 }}>−</Text>
              </TouchableOpacity>
              <View style={{ minWidth: 36, height: 28, borderRadius: 8, borderWidth: 1.5, borderColor: colors.accent, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>
                  {currentCat.sizeOffset === 0 ? '0' : currentCat.sizeOffset > 0 ? `+${currentCat.sizeOffset}` : `${currentCat.sizeOffset}`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSizeOffset(fontCategory, currentCat.sizeOffset + 1)}
                style={{ width: 32, height: 28, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginTop: -2 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── PALETTE ── */}
        {mainTab === 'Palette' && (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text2, letterSpacing: 1, marginBottom: 8 }}>APP PALETTE</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {activeThemeColors.map((c, i) => (
                <View
                  key={i}
                  style={{ flex: 1, aspectRatio: 1.6, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text style={{ color: i === 2 || i === 3 ? colors.bg : colors.text, fontSize: 9, fontWeight: '700' }}>
                    {i === 0 ? 'BG' : i === 1 ? 'CARD' : i === 2 ? 'ACCENT' : 'TEXT'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}
