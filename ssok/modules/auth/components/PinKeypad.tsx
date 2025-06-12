import React from 'react';
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
  return (
    <View style={[styles.container, containerStyle]}>
      {/* 숫자 키패드 1-9 */}
      <View style={styles.keypadRow}>
        {[1, 2, 3].map((num) => (
          <Pressable
            key={num}
            style={styles.keypadButton}
            onPress={() => onPressNumber(num)}
          >
            <Text style={styles.keypadButtonText}>{num}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.keypadRow}>
        {[4, 5, 6].map((num) => (
          <Pressable
            key={num}
            style={styles.keypadButton}
            onPress={() => onPressNumber(num)}
          >
            <Text style={styles.keypadButtonText}>{num}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.keypadRow}>
        {[7, 8, 9].map((num) => (
          <Pressable
            key={num}
            style={styles.keypadButton}
            onPress={() => onPressNumber(num)}
          >
            <Text style={styles.keypadButtonText}>{num}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.keypadRow}>
        {/* 빈 공간 */}
        <View style={styles.keypadEmpty} />

        <Pressable
          style={styles.keypadButton}
          onPress={() => onPressNumber(0)}
        >
          <Text style={styles.keypadButtonText}>0</Text>
        </Pressable>

        {/* 삭제 버튼 */}
        <Pressable style={styles.keypadButton} onPress={onPressDelete}>
          <Text style={styles.keypadButtonText}>←</Text>
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
  keypadButtonText: {
    fontSize: 24,
    color: colors.white,
  },
  keypadEmpty: {
    width: 70,
    height: 70,
  },
});

export default PinKeypad;
