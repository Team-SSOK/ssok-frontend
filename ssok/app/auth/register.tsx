import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import Header from '@/components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    birthday: '',
    phoneNumber: '',
    agreedToTerms: false,
  });

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    const { username, birthday, phoneNumber, agreedToTerms } = form;
    if (username && birthday && phoneNumber && agreedToTerms) {
      try {
        // 휴대폰 번호만 임시로 저장 (PIN 설정 후 완전히 등록됨)
        await AsyncStorage.setItem('@ssok:phone_number', phoneNumber);

        // PIN 번호 설정 화면으로 이동
        router.push('/auth/pin');
      } catch (error) {
        console.error('Error saving phone number:', error);
        Alert.alert('오류', '정보 저장 중 오류가 발생했습니다.');
      }
    }
  };

  const isDisabled =
    !form.username ||
    !form.birthday ||
    !form.phoneNumber ||
    !form.agreedToTerms;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* 헤더 */}
        <Header title="회원가입" />

        <View style={styles.content}>
          {/* 이름 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>이름</Text>
            <TextInput
              style={styles.input}
              placeholder="이름을 입력해주세요"
              value={form.username}
              onChangeText={(text) => handleChange('username', text)}
            />
          </View>

          {/* 생년월일 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>생년월일</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY.MM.DD"
              value={form.birthday}
              onChangeText={(text) => handleChange('birthday', text)}
              keyboardType="numeric"
            />
          </View>

          {/* 휴대폰 번호 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>휴대폰 번호</Text>
            <TextInput
              style={styles.input}
              placeholder="'-' 없이 입력해주세요"
              value={form.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
              keyboardType="phone-pad"
            />
          </View>

          {/* 약관 동의 */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => handleChange('agreedToTerms', !form.agreedToTerms)}
          >
            <Ionicons
              name={form.agreedToTerms ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={form.agreedToTerms ? colors.primary : colors.grey}
            />
            <Text style={styles.termsText}>약관 동의</Text>
          </TouchableOpacity>

          {/* 회원가입 버튼 */}
          <Button
            title="회원가입"
            variant={isDisabled ? 'disabled' : 'primary'}
            size="large"
            onPress={handleRegister}
            disabled={isDisabled}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  termsText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.black,
  },
});
