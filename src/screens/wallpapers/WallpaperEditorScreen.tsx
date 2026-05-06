import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { X, Check, Palette, Eye } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { LockscreenPreview } from '../../components/LockscreenPreview';
import { WALLPAPER_FILTERS, WallpaperFilterId, getFilterOverlay } from '../../constants/wallpaperFilters';

type EditorRouteParams = {
  WallpaperEditor: { imageUri: string; imageWidth: number; imageHeight: number };
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CROP_W = SCREEN_W - 32;
const CROP_H = CROP_W * (19.5 / 9);

type EditorMode = 'filter' | 'preview';

export function WallpaperEditorScreen() {
  const { colors, setCustomWallpaper } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<EditorRouteParams, 'WallpaperEditor'>>();
  const { imageUri } = route.params;

  const [mode, setMode] = useState<EditorMode>('filter');
  const [activeFilter, setActiveFilter] = useState<WallpaperFilterId>('original');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApply = () => {
    setIsProcessing(true);
    setCustomWallpaper({ uri: imageUri, filter: activeFilter });
    setIsProcessing(false);
    navigation.goBack();
  };

  const previewUri = imageUri;
  const filterOverlay = getFilterOverlay(activeFilter);

  const TABS: { id: EditorMode; icon: React.ReactNode; label: string }[] = [
    { id: 'filter',  icon: <Palette size={16} color={mode === 'filter'  ? colors.accent : colors.text3} />, label: 'Filter' },
    { id: 'preview', icon: <Eye size={16} color={mode === 'preview' ? colors.accent : colors.text3} />, label: 'Preview' },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-1">
          <X size={22} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-[15px] font-bold" style={{ color: colors.text }}>Edit Wallpaper</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -mr-1 opacity-0" disabled>
          <X size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Mode tabs */}
      <View className="flex-row mx-4 mb-3 rounded-2xl overflow-hidden" style={{ backgroundColor: colors.bg2 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setMode(tab.id)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5"
            style={mode === tab.id ? { backgroundColor: colors.bg3, borderRadius: 16 } : undefined}
          >
            {tab.icon}
            <Text
              className="text-[12px] font-bold"
              style={{ color: mode === tab.id ? colors.accent : colors.text3 }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── FILTER MODE ── */}
      {mode === 'filter' && (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
          {/* Image preview with active filter */}
          <View className="items-center justify-center my-4">
            <View style={{ width: CROP_W, height: CROP_H, borderRadius: 28, overflow: 'hidden' }}>
              <Image source={{ uri: previewUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              {filterOverlay && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: filterOverlay.color, opacity: filterOverlay.opacity }]} />
              )}
            </View>
          </View>

          {/* Filter strip */}
          <View style={{ paddingBottom: 12 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 8 }}
            >
              {WALLPAPER_FILTERS.map(f => {
                const isActive = activeFilter === f.id;
                const ov = f.color ? { color: f.color, opacity: f.opacity } : null;
                return (
                  <TouchableOpacity key={f.id} onPress={() => setActiveFilter(f.id)} className="items-center">
                    <View
                      style={{
                        width: 48,
                        height: 76,
                        borderRadius: 10,
                        overflow: 'hidden',
                        borderWidth: isActive ? 2.5 : 1,
                        borderColor: isActive ? colors.accent : colors.border,
                      }}
                    >
                      <Image source={{ uri: previewUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      {ov && (
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: ov.color, opacity: ov.opacity }]} />
                      )}
                    </View>
                    <Text
                      className="text-[10px] font-bold mt-1"
                      style={{ color: isActive ? colors.accent : colors.text3 }}
                    >
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {/* ── PREVIEW MODE ── */}
      {mode === 'preview' && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ alignItems: 'center', paddingTop: 8, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: colors.text3 }}>
            Lockscreen Preview
          </Text>
          {/* scale preview to fit screen */}
          <View style={{ transform: [{ scale: (SCREEN_W - 48) / (SCREEN_W - 64) }] }}>
            <View style={{ pointerEvents: 'none' }}>
              <LockscreenPreview wallpaperUri={previewUri} filterOverlay={filterOverlay} />
            </View>
          </View>
          <Text className="text-[11px] mt-4 text-center px-8" style={{ color: colors.text3 }}>
            Tap the button below to use this wallpaper on your lockscreen.
          </Text>
        </ScrollView>
      )}

      {/* ── FLOATING CONFIRM ACTION BUTTON ── */}
      <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16, elevation: 10 }}>
        <TouchableOpacity
          onPress={handleApply}
          disabled={isProcessing}
          className="flex-row items-center justify-center gap-2 py-4 rounded-2xl"
          style={{
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
          }}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={colors.bg} />
          ) : (
            <>
              <Check size={18} color={colors.bg} strokeWidth={3} />
              <Text className="text-[15px] font-extrabold uppercase tracking-widest" style={{ color: colors.bg }}>
                Set as Wallpaper
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
