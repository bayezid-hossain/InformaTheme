import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { useTheme } from '../../hooks/useTheme';
import { usePermissions } from '../../hooks/usePermissions';
import { useWeather } from '../../hooks/useWeather';
import * as Location from 'expo-location';
import { User, Cloud, Lock, Smartphone, Battery, Zap, AlertTriangle, Palette, PenTool, Info, MapPin } from 'lucide-react-native';

export function SettingsScreen() {
  const { colors, variant } = useTheme();
  const perms = usePermissions();
  const { refresh: refreshWeather } = useWeather();
  const [locationGranted, setLocationGranted] = React.useState<boolean>(false);
  const themeLabel = variant === 'darkPremium' ? 'Dark Premium' : variant === 'warmLight' ? 'Warm Light' : 'Glassmorphism';

  React.useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setLocationGranted(status === 'granted');
    });
  }, []);

  async function grantLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationGranted(status === 'granted');
    if (status === 'granted') {
      refreshWeather();
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
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3">
            <View className="w-6 items-center"><Cloud size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Cloud Sync</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>Off</Text>
            <Text className="text-lg ml-1" style={{ color: colors.text3 }}>›</Text>
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
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3">
            <View className="w-6 items-center"><Palette size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Active Theme</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>{themeLabel}</Text>
            <Text className="text-lg ml-1" style={{ color: colors.text3 }}>›</Text>
          </TouchableOpacity>
          <View className="h-px ml-[52px]" style={{ backgroundColor: colors.border }} />
          <TouchableOpacity className="flex-row items-center px-4 py-3.5 gap-3">
            <View className="w-6 items-center"><PenTool size={20} color={colors.text} /></View>
            <Text className="flex-1 text-[15px]" style={{ color: colors.text }}>Font Style</Text>
            <Text className="text-[13px]" style={{ color: colors.text3 }}>Space Grotesk</Text>
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
