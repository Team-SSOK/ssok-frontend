import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress, containerStyle }) => {
  const renderNumberButton = (number: string) => (
    <TouchableOpacity
      key={number}
      style={styles.keypadButton}
      onPress={() => onKeyPress(number)}
      activeOpacity={0.7}
    >
      <Text style={styles.keypadButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.row}>{['1', '2', '3'].map(renderNumberButton)}</View>
      <View style={styles.row}>{['4', '5', '6'].map(renderNumberButton)}</View>
      <View style={styles.row}>{['7', '8', '9'].map(renderNumberButton)}</View>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.keypadButton}
          onPress={() => onKeyPress('clear')}
          activeOpacity={0.7}
        >
          <Text style={styles.keypadButtonText}>C</Text>
        </TouchableOpacity>

        {renderNumberButton('0')}

        <TouchableOpacity
          style={styles.keypadButton}
          onPress={() => onKeyPress('delete')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  keypadButton: {
    width: '30%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonText: {
    fontSize: 28,
    fontWeight: '400',
    color: colors.black,
  },
});

export default Keypad;
