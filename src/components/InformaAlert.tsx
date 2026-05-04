import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface Props {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
}

export function InformaAlert({ visible, title, message, buttons, onClose }: Props) {
  const { colors, variant: themeVariant } = useTheme();

  const isDestructive = buttons.some(btn => btn.style === 'destructive');
  const accentColor = isDestructive ? '#ef4444' : colors.accent;
  
  const Icon = isDestructive ? Trash2 : title.toLowerCase().includes('delete') ? AlertTriangle : Info;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop with heavy blur */}
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={[styles.container, { backgroundColor: colors.bg1, borderColor: colors.border }]}>
          {/* Top Danger Bar for destructive alerts */}
          {isDestructive && <View style={[styles.dangerBar, { backgroundColor: '#ef4444' }]} />}
          
          <View style={styles.content}>
            <View style={[styles.iconBox, { borderColor: accentColor, backgroundColor: isDestructive ? 'rgba(239,68,68,0.05)' : colors.accentDim }]}>
              <Icon size={28} color={accentColor} strokeWidth={2.5} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {title.toUpperCase()}
            </Text>
            
            <Text style={[styles.message, { color: colors.text2 }]}>
              {message}
            </Text>
          </View>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            {buttons.map((btn, index) => {
              const btnDestructive = btn.style === 'destructive';
              const btnCancel = btn.style === 'cancel';
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    btn.onPress?.();
                    onClose();
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.button,
                    index > 0 && { borderLeftColor: colors.border, borderLeftWidth: 1 },
                    btnDestructive && { backgroundColor: 'rgba(239,68,68,0.08)' }
                  ]}
                >
                  <Text style={[
                    styles.buttonText,
                    { 
                      color: btnDestructive ? '#ef4444' : btnCancel ? colors.text3 : colors.accent,
                      fontFamily: btnDestructive || !btnCancel ? 'SpaceGrotesk_700Bold' : 'SpaceGrotesk_500Medium'
                    }
                  ]}>
                    {btn.text.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  dangerBar: {
    height: 4,
    width: '100%',
  },
  content: {
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'SirinStencil_400Regular',
    letterSpacing: 2,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'SpaceGrotesk_400Regular',
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 64,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    letterSpacing: 1.5,
  },
});
