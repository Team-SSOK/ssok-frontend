import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '@/constants/colors';

interface PinKeypadProps {
  onPressNumber: (num: number) => void;
  onPressDelete: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const PinKeypad: React.FC<PinKeypadProps> = ({
  onPressNumber,
  onPressDelete,
  containerStyle,
}) => {
  const [randomLayout, setRandomLayout] = useState<number[]>([]);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);

  // 숫자 배열을 랜덤하게 섞는 함수
  const shuffleNumbers = useCallback(() => {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = [...numbers];
    
    // Fisher-Yates 알고리즘으로 배열 섞기
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }, []);

  // 컴포넌트 마운트 시 랜덤 배열 생성
  useEffect(() => {
    setRandomLayout(shuffleNumbers());
  }, [shuffleNumbers]);

  // 가짜 hover 효과를 생성하는 함수
  const createFakeHover = useCallback(() => {
    // 실제 눌린 버튼이 아닌 다른 랜덤한 버튼 선택
    const availableNumbers = randomLayout.filter((_, index) => index < 10); // 0-9만
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const fakeHoverNumber = availableNumbers[randomIndex];
    
    setHoveredButton(fakeHoverNumber);
    
    // 200ms 후 hover 효과 제거
    setTimeout(() => {
      setHoveredButton(null);
    }, 200);
  }, [randomLayout]);

  // 숫자 버튼 클릭 핸들러
  const handleNumberPress = useCallback((actualNumber: number) => {
    createFakeHover();
    onPressNumber(actualNumber);
  }, [onPressNumber, createFakeHover]);

  // 삭제 버튼 클릭 핸들러
  const handleDeletePress = useCallback(() => {
    createFakeHover();
    onPressDelete();
  }, [onPressDelete, createFakeHover]);

  // 랜덤 배열이 아직 생성되지 않았으면 로딩
  if (randomLayout.length === 0) {
    return <View style={[styles.container, containerStyle]} />;
  }

  // 랜덤 배열을 3x3 + 1 형태로 배치
  const rows = [
    randomLayout.slice(0, 3),
    randomLayout.slice(3, 6),
    randomLayout.slice(6, 9),
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 숫자 키패드 1-3행 */}
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keypadRow}>
          {row.map((num) => (
            <Pressable
              key={num}
              style={[
                styles.keypadButton,
                hoveredButton === num && styles.keypadButtonHovered,
              ]}
              onPress={() => handleNumberPress(num)}
            >
              <Text style={[
                styles.keypadButtonText,
                hoveredButton === num && styles.keypadButtonTextHovered,
              ]}>
                {num}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}

      {/* 마지막 행: 빈 공간, 0, 삭제 */}
      <View style={styles.keypadRow}>
        <View style={styles.keypadEmpty} />

        <Pressable
          style={[
            styles.keypadButton,
            hoveredButton === randomLayout[9] && styles.keypadButtonHovered,
          ]}
          onPress={() => handleNumberPress(randomLayout[9])}
        >
          <Text style={[
            styles.keypadButtonText,
            hoveredButton === randomLayout[9] && styles.keypadButtonTextHovered,
          ]}>
            {randomLayout[9]}
          </Text>
        </Pressable>

        <Pressable 
          style={[
            styles.keypadButton,
            hoveredButton === -1 && styles.keypadButtonHovered, // 삭제 버튼용 특별한 ID
          ]}
          onPress={handleDeletePress}
        >
          <Text style={[
            styles.keypadButtonText,
            hoveredButton === -1 && styles.keypadButtonTextHovered,
          ]}>
            ←
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    maxWidth: 300,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonHovered: {
    backgroundColor: colors.primary,
    transform: [{ scale: 0.95 }],
  },
  keypadButtonText: {
    fontSize: 24,
    color: colors.white,
  },
  keypadButtonTextHovered: {
    color: colors.white,
    fontWeight: 'bold',
  },
  keypadEmpty: {
    width: 70,
    height: 70,
  },
});

export default PinKeypad;
