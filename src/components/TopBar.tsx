import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';

interface Props {
  title: string;
  rightElement?: React.ReactNode;
}

export function TopBar({ title, rightElement }: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  return (
    <View
      className="h-[52px] flex-row items-center px-4 border-b"
      style={{ borderBottomColor: colors.border }}
    >
      <View className="w-10">
        {canGoBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 justify-center">
            <Text className="text-[22px]" style={{ color: colors.text2 }}>←</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="flex-1 text-center text-base font-semibold tracking-wide" style={{ color: colors.text }}>
        {title}
      </Text>
      <View className="w-10 items-end">{rightElement ?? null}</View>
    </View>
  );
}
