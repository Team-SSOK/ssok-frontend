import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

interface SlideItemProps {
  item: React.ReactNode;
}

/**
 * 슬라이드 단일 아이템 컴포넌트
 * 각 슬라이드를 화면에 렌더링하는 역할
 */
const SlideItem = React.memo(({ item }: SlideItemProps) => (
  <View style={[styles.slide, { width }]}>{item}</View>
));

const styles = StyleSheet.create({
  slide: {
    flex: 1,
  },
});

export default SlideItem;
