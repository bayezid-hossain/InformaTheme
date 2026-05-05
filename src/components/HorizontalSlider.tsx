import React from 'react';
import { View, ScrollView, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
}

export function HorizontalSlider({ children }: Props) {
  const items = React.Children.toArray(children);
  
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={width - 64} // Matches the PHONE_W in LockscreenPreview
        snapToAlignment="center"
        contentContainerStyle={styles.content}
      >
        {items.map((item, index) => (
          <View key={index} style={{ width: width - 64 }}>
             {item}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  content: {
    paddingHorizontal: 0,
  }
});
