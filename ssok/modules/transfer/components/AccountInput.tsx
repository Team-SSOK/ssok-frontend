import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomTextInput from '@/components/TextInput';

interface AccountInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const AccountInput: React.FC<AccountInputProps> = ({ value, onChangeText }) => {
  // 숫자만 입력 가능하도록 필터링
  const handleChangeText = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, '');
    if (filtered.length <= 15) {
      onChangeText(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <CustomTextInput
        label="계좌번호 입력"
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
});

export default AccountInput;
