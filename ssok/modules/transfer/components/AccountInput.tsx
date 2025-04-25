import React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { colors } from '@/constants/colors';

interface AccountInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const AccountInput: React.FC<AccountInputProps> = ({ value, onChangeText }) => {
  // 숫자만 입력 가능하도록 필터링
  const handleChangeText = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, '');
    onChangeText(filtered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>계좌번호</Text>
      <TextInput
        style={styles.input}
        placeholder="'-' 없이 입력해주세요"
        placeholderTextColor={colors.lGrey}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        autoFocus
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
  },
});

export default AccountInput;
