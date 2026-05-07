import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { TopBar } from '../../components/TopBar';
import { useTheme, themeWallpapers } from '../../hooks/useTheme';
import { useOverlay } from '../../hooks/useOverlay';
import { useDates } from '../../context/DateStoreContext';
import { ThemeVariant } from '../../theme/colors';
import { getFilterOverlay } from '../../constants/wallpaperFilters';
import { LockscreenPreview } from '../../components/LockscreenPreview';
import { Check, RotateCcw, ImagePlus, Trash2, Pencil, X, Crop } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_W = (width - 42) / 2;

interface WallpaperItem {
  id: ThemeVariant;
  name: string;
}

const WALLPAPERS: WallpaperItem[] = [
  { id: 'onyxGold',     name: 'Onyx & Gold' },
  { id: 'darkPremium',    name: 'Dark Premium' },
  { id: 'royalAmethyst',  name: 'Royal Amethyst' },
  { id: 'midnightStars',  name: 'Midnight Stars' },
  { id: 'roseQuartz',     name: 'Rose Quartz' },
  { id: 'warmLight',      name: 'Warm Light' },
  { id: 'cobaltNight',    name: 'Cobalt Night' },
  { id: 'oceanDive',      name: 'Ocean Dive' },
  { id: 'glassmorphism',  name: 'Glassmorphism' },
  { id: 'warmEarth',      name: 'Warm Earth' },
  { id: 'deepForest',     name: 'Deep Forest' },
  { id: 'softSage',       name: 'Soft Sage' },
];

export function WallpapersScreen() {
  const { colors, variant, selectedWallpaper, setSelectedWallpaper, customWallpaper, setCustomWallpaper } = useTheme();
  const overlay = useOverlay();
  const { dates } = useDates();
  const navigation = useNavigation<any>();
  const [previewWallpaperId, setPreviewWallpaperId] = useState<ThemeVariant | null>(null);

  const isCustomActive = customWallpaper !== null;

  const handleSelectWallpaper = async (wpId: ThemeVariant | null) => {
    // Switching to theme wallpaper — clear custom
    setCustomWallpaper(null);
    setSelectedWallpaper(wpId);
    const activeWpKey = wpId || variant;
    const wpName = `wp_${activeWpKey.replace(/([A-Z])/g, '_$1').toLowerCase()}`;
    await overlay.syncData(variant, colors, dates, undefined, undefined, wpName);
  };

  const handlePickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const { uri, width: imgW, height: imgH } = result.assets[0];
      navigation.navigate('WallpaperEditor', {
        imageUri: uri,
        imageWidth: imgW ?? 1080,
        imageHeight: imgH ?? 1920,
      });
    }
  };

  const handleEditPreset = (wpId: ThemeVariant) => {
    const source = themeWallpapers[wpId];
    const resolved = (require('react-native').Image as any).resolveAssetSource(source);
    if (!resolved?.uri) return;

    let uri: string = resolved.uri;

    // In dev, Metro serves assets via HTTP. Fix the host for real devices:
    // resolveAssetSource may return 10.0.2.2 (emulator loopback) even on physical devices.
    if (uri.startsWith('http')) {
      const hostUri = (Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.hostUri) as string | undefined;
      if (hostUri) {
        const metroHost = hostUri.split(':')[0];
        uri = uri.replace(/10\.0\.2\.2|localhost|127\.0\.0\.1/g, metroHost);
      }
    }

    navigation.navigate('WallpaperEditor', {
      imageUri: uri,
      imageWidth: resolved.width ?? 1080,
      imageHeight: resolved.height ?? 1920,
    });
  };

  const handleRemoveCustom = async () => {
    setCustomWallpaper(null);
    const wpKey = selectedWallpaper || variant;
    const wpName = `wp_${wpKey.replace(/([A-Z])/g, '_$1').toLowerCase()}`;
    await overlay.syncData(variant, colors, dates, undefined, undefined, wpName);
  };

  const customFilterOverlay = customWallpaper ? getFilterOverlay(customWallpaper.filter) : null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <TopBar title="Wallpapers" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── From Gallery ── */}
        <TouchableOpacity
          onPress={handlePickFromGallery}
          className="rounded-2xl border p-4 flex-row items-center gap-3 mb-3"
          style={{ backgroundColor: colors.bg2, borderColor: colors.border }}
        >
          <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.accentDim }}>
            <ImagePlus size={20} color={colors.accent} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-bold" style={{ color: colors.text }}>Choose from Gallery</Text>
            <Text className="text-[11px] mt-0.5" style={{ color: colors.text3 }}>Pick, crop, and filter any photo</Text>
          </View>
        </TouchableOpacity>

        {/* ── Custom Wallpaper Card ── */}
        {customWallpaper && (
          <View
            className="rounded-2xl overflow-hidden mb-5"
            style={{
              borderWidth: 2.5,
              borderColor: colors.accent,
              elevation: 4,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            }}
          >
            <View style={{ height: CARD_W * 1.5 }}>
              <Image source={{ uri: customWallpaper.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              {customFilterOverlay && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: customFilterOverlay.color, opacity: customFilterOverlay.opacity }]} />
              )}
              <View className="absolute top-2 right-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.accent }}>
                <Text className="text-[10px] font-bold" style={{ color: colors.bg }}>ACTIVE</Text>
              </View>
              <View className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60">
                <Text className="text-[9px] font-bold text-white uppercase">
                  {customWallpaper.filter === 'original' ? 'No Filter' : customWallpaper.filter}
                </Text>
              </View>
            </View>
            <View className="px-3 py-2.5 flex-row items-center justify-between" style={{ backgroundColor: colors.bg2 }}>
              <Text className="text-[13px] font-bold" style={{ color: colors.accent }}>Custom Photo</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: colors.bg3 }}
                >
                  <Pencil size={12} color={colors.text2} />
                  <Text className="text-[11px] font-bold" style={{ color: colors.text2 }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRemoveCustom}
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: colors.bg3 }}
                >
                  <Trash2 size={12} color="#F87171" />
                  <Text className="text-[11px] font-bold" style={{ color: '#F87171' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── Reset to theme default ── */}
        <TouchableOpacity
          onPress={() => handleSelectWallpaper(null)}
          className="rounded-2xl border p-5 flex-row items-center justify-center mb-6 gap-3"
          style={{
            backgroundColor: !isCustomActive && selectedWallpaper === null ? colors.accentDim : colors.bg2,
            borderColor: !isCustomActive && selectedWallpaper === null ? colors.accent : colors.border,
          }}
        >
          <RotateCcw size={20} color={!isCustomActive && selectedWallpaper === null ? colors.accent : colors.text2} />
          <View>
            <Text className="text-[15px] font-bold" style={{ color: !isCustomActive && selectedWallpaper === null ? colors.accent : colors.text }}>
              Use Active Theme Default
            </Text>
            <Text className="text-[11px] mt-0.5" style={{ color: colors.text3 }}>
              Current: {variant.charAt(0).toUpperCase() + variant.slice(1).replace(/([A-Z])/g, ' $1')}
            </Text>
          </View>
        </TouchableOpacity>

        <Text className="text-[11px] font-bold tracking-[1.2px] mb-3.5 uppercase" style={{ color: colors.text3 }}>
          PREMIUM WALLPAPERS ({WALLPAPERS.length})
        </Text>

        <View className="flex-row flex-wrap justify-between gap-y-3.5">
          {WALLPAPERS.map(w => {
            const isActive = !isCustomActive && ((selectedWallpaper === null && variant === w.id) || selectedWallpaper === w.id);
            const isExplicit = !isCustomActive && selectedWallpaper === w.id;

            return (
              <View
                key={w.id}
                className="rounded-[18px] overflow-hidden"
                style={{
                  width: CARD_W,
                  borderWidth: isActive ? 2.5 : 1,
                  borderColor: isActive ? colors.accent : colors.border,
                  elevation: isActive ? 4 : 0,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isActive ? 0.3 : 0,
                  shadowRadius: 4,
                }}
              >
                <View style={{ height: CARD_W * 1.5, backgroundColor: colors.bg3 }}>
                  <Image source={themeWallpapers[w.id]} style={{ width: '100%', height: '100%' }} resizeMode="stretch" />
                  {isActive && (
                    <View className="absolute top-2 right-2 w-6 h-6 rounded-full justify-center items-center" style={{ backgroundColor: colors.accent }}>
                      <Check size={14} color="#000" strokeWidth={3.5} />
                    </View>
                  )}
                  {selectedWallpaper === null && !isCustomActive && variant === w.id && (
                    <View className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60">
                      <Text className="text-[9px] font-bold text-white uppercase">Theme Default</Text>
                    </View>
                  )}
                  {isExplicit && (
                    <View className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60">
                      <Text className="text-[9px] font-bold text-white uppercase">Custom Set</Text>
                    </View>
                  )}
                </View>
                <View className="px-2 pb-2.5 pt-1.5" style={{ backgroundColor: colors.bg2 }}>
                  <Text className="text-[13px] font-bold mb-2 px-1" numberOfLines={1} style={{ color: isActive ? colors.accent : colors.text }}>
                    {w.name}
                  </Text>
                  <View className="flex-row gap-1.5">
                    <TouchableOpacity
                      onPress={() => handleEditPreset(w.id)}
                      className="flex-1 py-1.5 rounded-lg items-center justify-center flex-row gap-1"
                      style={{ backgroundColor: colors.accent }}
                    >
                      <Crop size={11} color={colors.bg} strokeWidth={2.5} />
                      <Text className="text-[11px] font-extrabold" style={{ color: colors.bg }}>Set</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Preview Modal */}
        <Modal
          visible={previewWallpaperId !== null}
          transparent={false}
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => setPreviewWallpaperId(null)}
        >
          <View style={{ flex: 1, backgroundColor: colors.bg }}>
            {/* Immersive Lockscreen Preview */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <LockscreenPreview 
                wallpaperUri={previewWallpaperId ? themeWallpapers[previewWallpaperId] : undefined} 
                isFullScreen={true}
              />
            </View>

            {/* Top Floating Controls */}
            <SafeAreaView style={{ flex: 0 }} edges={['top']}>
              <View className="flex-row items-center px-6 pt-4">
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold shadow-lg">
                    {WALLPAPERS.find(w => w.id === previewWallpaperId)?.name}
                  </Text>
                  <Text className="text-white/60 text-xs font-medium">Immersive Preview</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPreviewWallpaperId(null)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* Bottom Floating Actions */}
            <SafeAreaView style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} edges={['bottom']}>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 }}
              />
              <View className="px-6 pb-8 pt-4 flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setPreviewWallpaperId(null)}
                  className="flex-1 h-14 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Text className="text-white text-[15px] font-bold">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    if (previewWallpaperId) {
                      await handleSelectWallpaper(previewWallpaperId);
                      setPreviewWallpaperId(null);
                    }
                  }}
                  className="flex-[2] h-14 rounded-2xl items-center justify-center shadow-xl"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Text className="text-[15px] font-extrabold" style={{ color: colors.bg }}>Set as Lockscreen</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
