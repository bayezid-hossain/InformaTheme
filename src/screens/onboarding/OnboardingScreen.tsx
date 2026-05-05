import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { Lock, Sprout, Palette, Smartphone, Bell } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePermissions } from '../../hooks/usePermissions';

const { width } = Dimensions.get('window');

// Each step has its own accent color matching the design
const STEP_ACCENT = ['#4ADE80', '#2DD4BF', '#A78BFA', '#FB923C'];

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
  const [waiting, setWaiting] = useState<'overlay' | 'fsi' | 'notifications' | null>(null);
  const androidVersion = parseInt(Platform.Version.toString(), 10);
  const needsNotifPerm = Platform.OS === 'android' && androidVersion >= 33;
  const perms = usePermissions();
  const accent = STEP_ACCENT[step];
    const isLast = step === 3;

  // Clear waiting state when the corresponding permission is granted
  useEffect(() => {
    if (waiting === 'overlay'        && perms.overlay)           setWaiting(null);
    if (waiting === 'fsi'            && perms.fullScreenIntent)  setWaiting(null);
    if (waiting === 'notifications'  && perms.notifications)     setWaiting(null);
  }, [perms.overlay, perms.fullScreenIntent, perms.notifications, waiting]);

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

  async function grantNotifications() {
    if (perms.notifications || !needsNotifPerm) return;
    setWaiting('notifications');
    await perms.requestNotifications();
  }

  const allGranted = perms.overlay && perms.fullScreenIntent && (!needsNotifPerm || perms.notifications);

  function handleCTA() {
    if (!isLast) { setStep((s) => s + 1); return; }
    if (!perms.overlay)          { grantOverlay();       return; }
    if (!perms.fullScreenIntent) { grantFSI();           return; }
    if (needsNotifPerm && !perms.notifications) { grantNotifications(); return; }
    onDone();
  }

  function ctaLabel() {
    if (!isLast) return step === 0 ? 'Get Started' : 'Continue';
    if (!allGranted) return 'Grant Permissions';
    return "Let's Go";
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Progress dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 20, gap: 6 }}>
        {[0, 1, 2, 3].map((i) => (
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
        {!isLast ? (
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
            {/* Grant permissions step */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: TEXT, textAlign: 'center', marginBottom: 12, lineHeight: 36 }}>
              Grant Permissions
            </Text>
            <Text style={{ fontSize: 15, color: TEXT2, textAlign: 'center', lineHeight: 24, marginBottom: 32 }}>
              To show your overlay on the lockscreen, we need two Android permissions. We'll walk you through each one.
            </Text>

            {/* Overlay permission card */}
            <View style={{
              width: width - 64,
              backgroundColor: CARD_BG,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: BORDER,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: perms.overlay ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' }}>
                <Lock size={18} color={TEXT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 2 }}>
                  Display over other apps
                </Text>
                <Text style={{ fontSize: 11, color: TEXT3 }}>
                  Required for lockscreen overlay
                </Text>
              </View>
              {perms.overlay ? (
                <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(74,222,128,0.15)' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#4ADE80' }}>✓</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={grantOverlay}
                  style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: accent }}
                >
                  {waiting === 'overlay' ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#000' }}>Grant</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* FSI permission card */}
            <View style={{
              width: width - 64,
              backgroundColor: CARD_BG,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: BORDER,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: perms.fullScreenIntent ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' }}>
                <Smartphone size={18} color={TEXT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 2 }}>
                  Full Screen Intent
                </Text>
                <Text style={{ fontSize: 11, color: TEXT3 }}>
                  Required for lockscreen quality
                </Text>
              </View>
              {perms.fullScreenIntent ? (
                <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(74,222,128,0.15)' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#4ADE80' }}>✓</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={grantFSI}
                  style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: accent }}
                >
                  {waiting === 'fsi' ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#000' }}>Grant</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Notifications permission card (Android 13+) */}
            {needsNotifPerm && (
              <View style={{
                width: width - 64,
                backgroundColor: CARD_BG,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: BORDER,
                padding: 16,
                marginTop: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: perms.notifications ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' }}>
                  <Bell size={18} color={TEXT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 2 }}>
                    Notifications
                  </Text>
                  <Text style={{ fontSize: 11, color: TEXT3 }}>
                    Required to trigger lockscreen overlay
                  </Text>
                </View>
                {perms.notifications ? (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(74,222,128,0.15)' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#4ADE80' }}>✓</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={grantNotifications}
                    style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: accent }}
                  >
                    {waiting === 'notifications' ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#000' }}>Grant</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* FSI hint if system page not found */}
            {!perms.fullScreenIntent && (
              <View style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(251,146,60,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(251,146,60,0.2)', width: width - 64 }}>
                <Text style={{ fontSize: 11, color: '#FB923C', lineHeight: 17, textAlign: 'center' }}>
                  If the settings page doesn't open automatically, go to{'\n'}
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
