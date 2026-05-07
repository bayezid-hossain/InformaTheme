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
import { X, Check, Palette, Eye, Crop } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useTheme } from '../../hooks/useTheme';
import { LockscreenPreview } from '../../components/LockscreenPreview';
import { WALLPAPER_FILTERS, WallpaperFilterId, getFilterOverlay } from '../../constants/wallpaperFilters';

type EditorRouteParams = {
  WallpaperEditor: { imageUri: string; imageWidth: number; imageHeight: number };
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');

const CROP_ASPECT = 19.5 / 9;

// Crop frame: always leave VERT_MARGIN pixels visible above and below so
// the user can see how much image is being cut from top/bottom.
const VERT_MARGIN = 52;
const MAX_CROP_H = SCREEN_H * 0.68;
const CROP_DISP_H = Math.min(SCREEN_W * CROP_ASPECT, MAX_CROP_H - 2 * VERT_MARGIN);
const CROP_DISP_W = CROP_DISP_H / CROP_ASPECT;
const CONTAINER_H = CROP_DISP_H + 2 * VERT_MARGIN;
const SIDE_MARGIN = (SCREEN_W - CROP_DISP_W) / 2;

// Filter preview: small enough that filter strip fits below without scrolling
const FILTER_PREV_W = Math.round(SCREEN_W * 0.42);
const FILTER_PREV_H = Math.round(FILTER_PREV_W * CROP_ASPECT);

type EditorMode = 'crop' | 'filter' | 'preview';

export function WallpaperEditorScreen() {
  const { colors, setCustomWallpaper } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<EditorRouteParams, 'WallpaperEditor'>>();
  const { imageUri: initialUri, imageWidth: initialW, imageHeight: initialH } = route.params;

  const [mode, setMode] = useState<EditorMode>('crop');
  const [currentUri, setCurrentUri] = useState(initialUri);
  const [currentW, setCurrentW] = useState(initialW);
  const [currentH, setCurrentH] = useState(initialH);
  const [activeFilter, setActiveFilter] = useState<WallpaperFilterId>('original');
  const [isProcessing, setIsProcessing] = useState(false);

  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const baseFit = Math.max(CROP_DISP_W / currentW, CROP_DISP_H / currentH);

  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      const s = scale.value;
      const maxX = Math.max(0, (currentW * baseFit * s - CROP_DISP_W) / 2);
      const maxY = Math.max(0, (currentH * baseFit * s - CROP_DISP_H) / 2);
      offsetX.value = Math.min(maxX, Math.max(-maxX, savedOffsetX.value + e.translationX));
      offsetY.value = Math.min(maxY, Math.max(-maxY, savedOffsetY.value + e.translationY));
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      const newScale = Math.max(1, savedScale.value * e.scale);
      scale.value = newScale;
      const maxX = Math.max(0, (currentW * baseFit * newScale - CROP_DISP_W) / 2);
      const maxY = Math.max(0, (currentH * baseFit * newScale - CROP_DISP_H) / 2);
      offsetX.value = Math.min(maxX, Math.max(-maxX, offsetX.value));
      offsetY.value = Math.min(maxY, Math.max(-maxY, offsetY.value));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  const cropGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const cropImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  const resetCropState = () => {
    offsetX.value = 0; offsetY.value = 0; scale.value = 1;
    savedOffsetX.value = 0; savedOffsetY.value = 0; savedScale.value = 1;
  };

  const handleApplyCrop = async () => {
    setIsProcessing(true);
    try {
      const s = scale.value;
      const tx = offsetX.value;
      const ty = offsetY.value;

      const cx = CROP_DISP_W / 2 + tx;
      const cy = CROP_DISP_H / 2 + ty;
      const dispW = currentW * baseFit * s;
      const dispH = currentH * baseFit * s;

      const originX = Math.max(0, Math.round((cx - dispW / 2) * -1 / (baseFit * s)));
      const originY = Math.max(0, Math.round((cy - dispH / 2) * -1 / (baseFit * s)));
      const cropW = Math.max(1, Math.min(currentW - originX, Math.round(CROP_DISP_W / (baseFit * s))));
      const cropH = Math.max(1, Math.min(currentH - originY, Math.round(CROP_DISP_H / (baseFit * s))));

      const imageRef = await ImageManipulator
        .manipulate(currentUri)
        .crop({ originX, originY, width: cropW, height: cropH })
        .renderAsync();
      const saved = await imageRef.saveAsync({ compress: 0.9, format: SaveFormat.JPEG });

      setCurrentUri(saved.uri);
      setCurrentW(cropW);
      setCurrentH(cropH);
      resetCropState();
      setMode('filter');
    } catch (e) {
      console.error('[WallpaperEditor] crop failed:', e);
    }
    setIsProcessing(false);
  };

  const handleApply = () => {
    setCustomWallpaper({ uri: currentUri, filter: activeFilter });
    navigation.goBack();
  };

  const filterOverlay = getFilterOverlay(activeFilter);

  const TABS: { id: EditorMode; label: string; icon: React.ReactNode }[] = [
    { id: 'crop',    label: 'Crop',    icon: <Crop    size={15} color={mode === 'crop'    ? colors.accent : colors.text3} /> },
    { id: 'filter',  label: 'Filter',  icon: <Palette size={15} color={mode === 'filter'  ? colors.accent : colors.text3} /> },
    { id: 'preview', label: 'Preview', icon: <Eye     size={15} color={mode === 'preview' ? colors.accent : colors.text3} /> },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-1">
          <X size={22} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-[15px] font-bold" style={{ color: colors.text }}>Edit Wallpaper</Text>
        <View style={{ width: 38 }} />
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
            <Text className="text-[12px] font-bold" style={{ color: mode === tab.id ? colors.accent : colors.text3 }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── CROP MODE ── */}
      {mode === 'crop' && (
        <View className="flex-1 justify-center items-center">
          <View style={{ width: SCREEN_W, height: CONTAINER_H, overflow: 'hidden' }}>
            <GestureDetector gesture={cropGesture}>
              <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }, cropImageStyle]}>
                <Image
                  source={{ uri: currentUri }}
                  style={{ width: currentW * baseFit, height: currentH * baseFit }}
                  resizeMode="stretch"
                />
              </Animated.View>
            </GestureDetector>

            {/* Top dimmed panel */}
            <View pointerEvents="none" style={{
              position: 'absolute', left: 0, right: 0, top: 0,
              height: VERT_MARGIN,
              backgroundColor: 'rgba(0,0,0,0.55)',
            }} />
            {/* Bottom dimmed panel */}
            <View pointerEvents="none" style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              height: VERT_MARGIN,
              backgroundColor: 'rgba(0,0,0,0.55)',
            }} />
            {/* Left dimmed panel */}
            <View pointerEvents="none" style={{
              position: 'absolute', left: 0,
              top: VERT_MARGIN, bottom: VERT_MARGIN,
              width: SIDE_MARGIN,
              backgroundColor: 'rgba(0,0,0,0.55)',
            }} />
            {/* Right dimmed panel */}
            <View pointerEvents="none" style={{
              position: 'absolute', right: 0,
              top: VERT_MARGIN, bottom: VERT_MARGIN,
              width: SIDE_MARGIN,
              backgroundColor: 'rgba(0,0,0,0.55)',
            }} />

            {/* Crop frame border */}
            <View pointerEvents="none" style={{
              position: 'absolute',
              left: SIDE_MARGIN,
              top: VERT_MARGIN,
              width: CROP_DISP_W,
              height: CROP_DISP_H,
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.75)',
              borderRadius: 24,
            }} />
          </View>

          <Text className="text-[11px] font-medium mt-3" style={{ color: colors.text3 }}>
            Pinch to zoom · Drag to reposition
          </Text>
        </View>
      )}

      {/* ── FILTER MODE ── */}
      {mode === 'filter' && (
        <View className="flex-1">
          {/* Small preview — fits above the filter strip */}
          <View className="items-center" style={{ marginVertical: 16 }}>
            <View style={{ width: FILTER_PREV_W, height: FILTER_PREV_H, borderRadius: 20, overflow: 'hidden' }}>
              <Image source={{ uri: currentUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              {filterOverlay && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: filterOverlay.color, opacity: filterOverlay.opacity }]} />
              )}
            </View>
          </View>

          <Text className="text-[11px] font-bold uppercase tracking-widest mb-1 px-4" style={{ color: colors.text3 }}>
            Filters
          </Text>

          {/* Filter strip */}
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
                  <View style={{
                    width: 48, height: 76, borderRadius: 10, overflow: 'hidden',
                    borderWidth: isActive ? 2.5 : 1,
                    borderColor: isActive ? colors.accent : colors.border,
                  }}>
                    <Image source={{ uri: currentUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    {ov && <View style={[StyleSheet.absoluteFillObject, { backgroundColor: ov.color, opacity: ov.opacity }]} />}
                  </View>
                  <Text className="text-[10px] font-bold mt-1" style={{ color: isActive ? colors.accent : colors.text3 }}>
                    {f.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
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
          <View style={{ transform: [{ scale: (SCREEN_W - 48) / (SCREEN_W - 64) }] }}>
            <View style={{ pointerEvents: 'none' }}>
              <LockscreenPreview wallpaperUri={currentUri} filterOverlay={filterOverlay} />
            </View>
          </View>
        </ScrollView>
      )}

      {/* ── FLOATING ACTION ── */}
      <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16, elevation: 10 }}>
        <TouchableOpacity
          onPress={mode === 'crop' ? handleApplyCrop : handleApply}
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
          ) : mode === 'crop' ? (
            <>
              <Crop size={18} color={colors.bg} strokeWidth={2.5} />
              <Text className="text-[15px] font-extrabold uppercase tracking-widest" style={{ color: colors.bg }}>
                Apply Crop
              </Text>
            </>
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
