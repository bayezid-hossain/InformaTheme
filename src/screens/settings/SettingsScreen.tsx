import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Sharing from 'expo-sharing';
import { AlertTriangle, Battery, Cloud, Download, Folder, ImagePlus, Info, Lock, MapPin, Palette, PenTool, Share2, Smartphone, User, Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getFontDef } from '../../constants/fonts';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { useDates } from '../../context/DateStoreContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useTheme } from '../../hooks/useTheme';
import { useWeather } from '../../hooks/useWeather';
import { loadDatesFromDb } from '../../services/db';

export function SettingsScreen() {
  const { colors, variant, fontId } = useTheme();
  const navigation = useNavigation<any>();
  const perms = usePermissions();
  const { refresh: refreshWeather } = useWeather();
  const { persist } = useDates();
  const [locationGranted, setLocationGranted] = React.useState<boolean>(false);
  const [mediaGranted, setMediaGranted] = React.useState<boolean>(false);
  const themeLabel: Record<string, string> = {
    darkPremium: 'Dark Premium',
    warmLight: 'Warm Light',
    glassmorphism: 'Glassmorphism',
    deepForest: 'Deep Forest',
    softSage: 'Soft Sage',
    midnightStars: 'Midnight Stars',
    oceanDive: 'Ocean Dive',
    warmEarth: 'Warm Earth',
    onyxGold: 'Onyx & Gold',
    royalAmethyst: 'Royal Amethyst',
    roseQuartz: 'Rose Quartz',
    cobaltNight: 'Cobalt Night',
  };
  const activethemeLabel = themeLabel[variant] || 'Dark Premium';
  const currentFont = getFontDef(fontId);

  React.useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setLocationGranted(status === 'granted');
    });
    ImagePicker.getMediaLibraryPermissionsAsync().then(({ status }) => {
      setMediaGranted(status === 'granted');
    });
  }, []);

  async function grantLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationGranted(status === 'granted');
    if (status === 'granted') refreshWeather();
  }

  async function grantMedia() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setMediaGranted(status === 'granted');
  }

  async function handleBackupToWhatsApp() {
    try {
      const dates = loadDatesFromDb();
      if (dates.length === 0) {
        Alert.alert('No Data', 'There are no anchor dates to backup.');
        return;
      }

      const backupData = JSON.stringify(dates, null, 2);
      let fileUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ''}informatheme_backup.json`;
      if (!fileUri.startsWith('file://')) {
        fileUri = `file://${fileUri}`;
      }

      await FileSystem.writeAsStringAsync(fileUri, backupData, {
        encoding: 'utf8',
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Backup InformaTheme Dates',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Sharing Unavailable', 'Sharing is not supported on this device.');
      }
    } catch (err: any) {
      Alert.alert('Backup Failed', err.message);
    }
  }

  async function handleRestoreBackup() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsed = JSON.parse(fileContent);

      if (Array.isArray(parsed) && parsed.every(item => item.id && item.label && item.dateISO)) {
        persist(parsed);
        Alert.alert('Success', 'Backup restored successfully!');
      } else {
        Alert.alert('Invalid Backup', 'The selected file is not a valid InformaTheme backup.');
      }
    } catch (err: any) {
      Alert.alert('Restore Failed', 'Failed to read or parse backup file.');
    }
  }

  function permBadge(granted: boolean) {
    return (
      <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: granted ? colors.accentDim : 'rgba(239,68,68,0.15)' }}>
        <Text className="text-xs font-semibold" style={{ color: granted ? colors.accent : '#ef4444' }}>
          {granted ? '✓ Granted' : '✗ Required'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <TopBar title="Settings" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 }} showsVerticalScrollIndicator={false}>

        {/* Account */}
        <Text className="text-[11px] font-bold tracking-[1.2px] mb-2.5 px-1" style={{ color: colors.text3 }}>ACCOUNT</Text>
        <View className="rounded-2xl border overflow-hidden mb-6" style={{ backgroundColor: colors.bg2, borderColor: colors.border }}>
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3">
            <View className="w-6 items-center"><User size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Profile</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>me.bayezid@gmail.com</Text>
            <Text className="text-lg ml-1" style={{ color: colors.text3 }}>›</Text>
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3" disabled>
            <View className="w-6 items-center"><Cloud size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Cloud Sync</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>Coming Soon</Text>
          </TouchableOpacity>
        </View>

        {/* Permissions */}
        <Text className="text-[11px] font-bold tracking-[1.2px] mb-2.5 px-1" style={{ color: colors.text3 }}>PERMISSIONS</Text>
        <View className="rounded-2xl border overflow-hidden mb-6" style={{ backgroundColor: colors.bg2, borderColor: colors.border }}>
          <TouchableOpacity
            className="flex-row items-center px-4 py-3.5 gap-3"
            onPress={() => { if (!perms.overlay) perms.openOverlaySettings(); }}
          >
            <View className="w-6 items-center"><Lock size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Display Over Other Apps</Text>
            {perms.loading ? (
              <Text className="text-[13px]" style={{ color: colors.text3 }}>…</Text>
            ) : permBadge(perms.overlay)}
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity
            className="flex-row items-center px-4 py-3.5 gap-3"
            onPress={() => { if (!perms.fullScreenIntent) perms.openFSISettings(); }}
          >
            <View className="w-6 items-center"><Smartphone size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Full Screen Intent</Text>
            {perms.loading ? (
              <Text className="text-[13px]" style={{ color: colors.text3 }}>…</Text>
            ) : permBadge(perms.fullScreenIntent)}
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity
            className="flex-row items-center px-4 py-3.5 gap-3"
            onPress={grantLocation}
          >
            <View className="w-6 items-center"><MapPin size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Location Access</Text>
            {permBadge(locationGranted)}
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity
            className="flex-row items-center px-4 py-3.5 gap-3"
            onPress={() => { if (!mediaGranted) grantMedia(); }}
          >
            <View className="w-6 items-center"><ImagePlus size={20} color={colors.text} /></View>
            <View className="flex-1">
              <Text className="text-[15px]" style={{ color: colors.text }}>Photo Library</Text>
              <Text className="text-[11px]" style={{ color: colors.text3 }}>For custom wallpapers</Text>
            </View>
            {perms.loading ? (
              <Text className="text-[13px]" style={{ color: colors.text3 }}>…</Text>
            ) : permBadge(mediaGranted)}
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity
            className="flex-row items-center px-4 py-3.5 gap-3"
            onPress={() => { if (!perms.storage) perms.requestStoragePermission(); }}
          >
            <View className="w-6 items-center"><Folder size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Storage Access</Text>
            {perms.loading ? (
              <Text className="text-[13px]" style={{ color: colors.text3 }}>…</Text>
            ) : permBadge(perms.storage)}
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3">
            <View className="w-6 items-center"><Battery size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Battery Optimization</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>Unrestricted</Text>
            <Text className="text-lg ml-1" style={{ color: colors.text3 }}>›</Text>
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3">
            <View className="w-6 items-center"><Zap size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Start on Boot</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>Enabled</Text>
            <Text className="text-lg ml-1" style={{ color: colors.text3 }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Backup & Restore */}
        <Text className="text-[11px] font-bold tracking-[1.2px] mb-2.5 px-1" style={{ color: colors.text3 }}>BACKUP & RESTORE</Text>
        <View className="rounded-2xl border overflow-hidden mb-6" style={{ backgroundColor: colors.bg2, borderColor: colors.border }}>
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3" onPress={handleBackupToWhatsApp}>
            <View className="w-6 items-center"><Share2 size={20} color={colors.text} /></View>
            <View className="flex-1">
              <Text className="text-[15px]" style={{ color: colors.text }}>Backup dates</Text>
              <Text className="text-[11px]" style={{ color: colors.text3 }}>Share JSON backup file</Text>
            </View>
            <Text className="text-lg ml-1" style={{ color: colors.text3 }}>›</Text>
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3" onPress={handleRestoreBackup}>
            <View className="w-6 items-center"><Download size={20} color={colors.text} /></View>
            <View className="flex-1">
              <Text className="text-[15px]" style={{ color: colors.text }}>Restore Backup</Text>
              <Text className="text-[11px]" style={{ color: colors.text3 }}>Import JSON backup file</Text>
            </View>
            <Text className="text-lg ml-1" style={{ color: colors.text3 }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Hint when permissions missing */}
        {!perms.loading && (!perms.overlay || !perms.fullScreenIntent) && (
          <View className="flex-row items-start gap-2 rounded-xl px-4 py-3 mb-6 border" style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <Text className="flex-1 text-[13px] leading-5" style={{ color: '#ef4444' }}>
              Some permissions are missing. Tap the row to open Settings and grant them. InformaTheme won't display on the lockscreen without them.
            </Text>
          </View>
        )}

        {/* App */}
        <Text className="text-[11px] font-bold tracking-[1.2px] mb-2.5 px-1" style={{ color: colors.text3 }}>APP</Text>
        <View className="rounded-2xl border overflow-hidden" style={{ backgroundColor: colors.bg2, borderColor: colors.border }}>
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3" onPress={() => navigation.navigate('Theme')}>
            <View className="w-6 items-center"><Palette size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Active Theme</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>{activethemeLabel}</Text>
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3" onPress={() => navigation.navigate('Theme')}>
            <View className="w-6 items-center"><PenTool size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Font Style</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>{currentFont.name}</Text>
            <Text className="text-lg ml-1" style={{ color: colors.text3 }}>›</Text>
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3">
            <View className="w-6 items-center"><Info size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>About</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>v1.0.0</Text>
            <Text className="text-lg ml-1" style={{ color: colors.text3 }}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
