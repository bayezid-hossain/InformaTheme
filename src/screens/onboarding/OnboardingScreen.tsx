import * as Location from 'expo-location';
import { Folder, ImagePlus, Lock, MapPin, Palette, Smartphone, Sprout } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePermissions } from '../../hooks/usePermissions';

const { width } = Dimensions.get('window');

// Each step has its own accent color matching the design
const STEP_ACCENT = [
  '#4ADE80', // Step 0: Welcome
  '#2DD4BF', // Step 1: Dates
  '#A78BFA', // Step 2: Theme
  '#3B82F6', // Step 3: Overlay Permission
  '#EC4899', // Step 4: FSI Permission
  '#F59E0B', // Step 5: Location Permission
  '#10B981', // Step 6: Photo Library Permission
  '#6366F1', // Step 7: Storage Permission
];

const BG = '#0d0f12';
const CARD_BG = '#1a1e27';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#e8ecf2';
const TEXT2 = '#8892a4';
const TEXT3 = '#4a5568';

interface Props {
  onDone: () => void;
  initialStep?: number;
}

export function OnboardingScreen({ onDone, initialStep = 0 }: Props) {
  const [step, setStep] = useState(initialStep);
  const [waiting, setWaiting] = useState<'overlay' | 'fsi' | 'location' | 'media' | 'storage' | null>(null);
  const [locationPerm, setLocationPerm] = useState(false);
  const perms = usePermissions();
  const accent = STEP_ACCENT[step];
  const isLast = step === 7;

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPerm(status === 'granted');
    })();
  }, [waiting]);

  // Clear waiting state when the corresponding permission is granted
  useEffect(() => {
    if (waiting === 'overlay' && perms.overlay) setWaiting(null);
    if (waiting === 'fsi' && perms.fullScreenIntent) setWaiting(null);
    if (waiting === 'location' && locationPerm) setWaiting(null);
    if (waiting === 'media' && perms.mediaLibrary) setWaiting(null);
    if (waiting === 'storage' && perms.storage) setWaiting(null);
  }, [perms.overlay, perms.fullScreenIntent, perms.mediaLibrary, perms.storage, locationPerm, waiting]);

  function grantOverlay() {
    if (perms.overlay) return;
    perms.openOverlaySettings();
    setWaiting('overlay');
  }

  function grantFSI() {
    if (perms.fullScreenIntent) return;
    perms.openFSISettings();
    setWaiting('fsi');
  }

  async function grantLocation() {
    if (locationPerm) return;
    setWaiting('location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPerm(status === 'granted');
    setWaiting(null);
  }

  async function grantMedia() {
    if (perms.mediaLibrary) return;
    setWaiting('media');
    await perms.requestMediaLibrary();
    setWaiting(null);
  }

  async function grantStorage() {
    if (perms.storage) return;
    setWaiting('storage');
    await perms.requestStoragePermission();
    setWaiting(null);
  }

  function isGranted(s: number) {
    if (s === 3) return perms.overlay;
    if (s === 4) return perms.fullScreenIntent;
    if (s === 5) return locationPerm;
    if (s === 6) return perms.mediaLibrary;
    if (s === 7) return perms.storage;
    return false;
  }

  function handleCTA() {
    if (step === 0 || step === 1 || step === 2) {
      setStep((s) => s + 1);
      return;
    }
    if (step === 3) {
      if (perms.overlay) setStep(4);
      else grantOverlay();
      return;
    }
    if (step === 4) {
      if (perms.fullScreenIntent) setStep(5);
      else grantFSI();
      return;
    }
    if (step === 5) {
      if (locationPerm) setStep(6);
      else grantLocation();
      return;
    }
    if (step === 6) {
      if (perms.mediaLibrary) setStep(7);
      else grantMedia();
      return;
    }
    if (step === 7) {
      if (perms.storage) onDone();
      else grantStorage();
      return;
    }
  }

  function ctaLabel() {
    if (step === 0) return 'Get Started';
    if (step === 1 || step === 2) return 'Continue';
    if (isGranted(step)) return step === 7 ? 'Finish' : 'Continue';
    return 'Grant Permission';
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Progress dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 20, gap: 6 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View
            key={i}
            style={{
              height: 4,
              borderRadius: 2,
              width: i === step ? 24 : 8,
              backgroundColor: i < step ? '#2a3040' : i === step ? STEP_ACCENT[i] : '#1e2433',
            }}
          />
        ))}
      </View>

      {/* Content area */}
      <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center' }}>
        {step < 3 ? (
          <>
            {/* Icon */}
            <View style={{ marginBottom: 32 }}>
              {step === 0 ? <Lock size={72} color={TEXT} /> : step === 1 ? <Sprout size={72} color={TEXT} /> : <Palette size={72} color={TEXT} />}
            </View>
            {/* Title */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: TEXT, textAlign: 'center', marginBottom: 16, lineHeight: 36 }}>
              {step === 0 ? 'Your Life, Always Visible' :
               step === 1 ? 'Add Your Anchor Dates' :
               'Pick Your Theme'}
            </Text>
            {/* Description */}
            <Text style={{ fontSize: 15, color: TEXT2, textAlign: 'center', lineHeight: 24 }}>
              {step === 0
                ? 'InformaTheme places your most precious milestones right on your lockscreen.'
                : step === 1
                ? "Tell us what matters: a child's birthday, a wedding date, a personal goal. We'll track every day since."
                : 'Choose from nature-inspired lockscreen themes or design your own with custom colors and widgets.'}
            </Text>
          </>
        ) : (
          <>
            {/* Dedicated Icon Container with outer pulse glow */}
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.06)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 28,
              shadowColor: accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 4,
            }}>
              {step === 3 && <Lock size={44} color={accent} />}
              {step === 4 && <Smartphone size={44} color={accent} />}
              {step === 5 && <MapPin size={44} color={accent} />}
              {step === 6 && <ImagePlus size={44} color={accent} />}
              {step === 7 && <Folder size={44} color={accent} />}
            </View>

            {/* Title */}
            <Text style={{ fontSize: 26, fontWeight: '800', color: TEXT, textAlign: 'center', marginBottom: 12, lineHeight: 34 }}>
              {step === 3 && 'Display Over Other Apps'}
              {step === 4 && 'Full Screen Intent'}
              {step === 5 && 'Location Services'}
              {step === 6 && 'Photo Library Access'}
              {step === 7 && 'Storage Access'}
            </Text>

            {/* Description */}
            <Text style={{ fontSize: 14, color: TEXT2, textAlign: 'center', lineHeight: 22, paddingHorizontal: 12, marginBottom: 28 }}>
              {step === 3 && 'Allows InformaTheme to display your beautiful customized widgets directly on top of your system lockscreen whenever you wake your phone.'}
              {step === 4 && 'Required by Android to launch and render your lockscreen overlay with native, lag-free performance immediately upon device wake.'}
              {step === 5 && 'Enables the lockscreen weather widget to retrieve real-time local conditions and temperatures on-device. We never track or share your location.'}
              {step === 6 && 'Allows you to select, crop, and apply stunning custom filters to your personal gallery photos to use as wallpapers. (Highly recommended!)'}
              {step === 7 && 'Required to securely export and import your milestones, themes, and settings as JSON backup files, making them easily shareable on WhatsApp.'}
            </Text>

            {/* Premium Status Indicator Card */}
            <View style={{
              width: width - 64,
              backgroundColor: CARD_BG,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isGranted(step) ? 'rgba(74,222,128,0.2)' : BORDER,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isGranted(step) ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {step === 3 && <Lock size={18} color={isGranted(step) ? '#4ADE80' : TEXT2} />}
                  {step === 4 && <Smartphone size={18} color={isGranted(step) ? '#4ADE80' : TEXT2} />}
                  {step === 5 && <MapPin size={18} color={isGranted(step) ? '#4ADE80' : TEXT2} />}
                  {step === 6 && <ImagePlus size={18} color={isGranted(step) ? '#4ADE80' : TEXT2} />}
                  {step === 7 && <Folder size={18} color={isGranted(step) ? '#4ADE80' : TEXT2} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: TEXT }}>
                    {isGranted(step) ? 'Permission Granted' : 'Requires Approval'}
                  </Text>
                  <Text style={{ fontSize: 11, color: TEXT3, marginTop: 1 }}>
                    {step === 6 ? 'Optional permission' : 'Required for full features'}
                  </Text>
                </View>
              </View>

              {isGranted(step) ? (
                <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(74,222,128,0.15)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)' }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#4ADE80' }}>✓ Active</Text>
                </View>
              ) : (
                <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: TEXT2 }}>Pending</Text>
                </View>
              )}
            </View>

            {/* Special Instructions / Hints for FSI */}
            {step === 4 && !perms.fullScreenIntent && (
              <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(251,146,60,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(251,146,60,0.2)', width: width - 64 }}>
                <Text style={{ fontSize: 11, color: '#FB923C', lineHeight: 17, textAlign: 'center' }}>
                  If the settings page doesn't open automatically, go to:{'\n'}
                  <Text style={{ fontWeight: '700' }}>Settings → Apps → InformaTheme → Notifications</Text>
                  {'\n'}and enable "Allow full-screen displays"
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Footer */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32, gap: 12 }}>
        <TouchableOpacity
          onPress={handleCTA}
          style={{
            height: 56,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: accent,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#000' }}>{ctaLabel()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (isLast) onDone();
            else setStep((s) => s + 1);
          }}
          style={{ height: 36, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 14, color: TEXT3 }}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
