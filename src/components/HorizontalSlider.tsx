import React from 'react';
import { View, ScrollView, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width - 64;

interface Props {
  children: React.ReactNode;
}

export function HorizontalSlider({ children }: Props) {
  const items = React.Children.toArray(children);
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  if (items.length === 0) return null;

  const handleScroll = (event: any) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / cardWidth);
    if (index !== activeIndex && index >= 0 && index < items.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={cardWidth}
        snapToAlignment="center"
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => (
          <View key={index} style={{ width: cardWidth }}>
             {item}
          </View>
        ))}
      </ScrollView>
      
      {items.length > 1 && (
        <View style={styles.dotsContainer}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  content: {
    paddingHorizontal: 0,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 14,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 6,
  },
});
