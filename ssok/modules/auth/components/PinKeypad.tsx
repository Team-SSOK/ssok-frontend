import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
          <TouchableOpacity
            key={num}
            style={styles.keypadButton}
            onPress={() => onPressNumber(num)}
          >
            <Text style={styles.keypadButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.keypadRow}>
        {[4, 5, 6].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.keypadButton}
            onPress={() => onPressNumber(num)}
          >
            <Text style={styles.keypadButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.keypadRow}>
        {[7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.keypadButton}
            onPress={() => onPressNumber(num)}
          >
            <Text style={styles.keypadButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.keypadRow}>
        {/* 빈 공간 */}
        <View style={styles.keypadEmpty} />

        <TouchableOpacity
          style={styles.keypadButton}
          onPress={() => onPressNumber(0)}
        >
          <Text style={styles.keypadButtonText}>0</Text>
        </TouchableOpacity>

        {/* 삭제 버튼 */}
        <TouchableOpacity style={styles.keypadButton} onPress={onPressDelete}>
          <Text style={styles.keypadButtonText}>←</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '80%',
    maxWidth: 300,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontWeight: 'bold',
    color: colors.white,
  },
  keypadEmpty: {
    width: 70,
    height: 70,
  },
});

export default PinKeypad;
