import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';

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

  const handleGoBack = () => {
    router.back();
  };

  const handleRegister = () => {
    const { username, birthday, phoneNumber, agreedToTerms } = form;
    if (username && birthday && phoneNumber && agreedToTerms) {
      // 유효성 검사 후 회원가입 처리
      router.push('/auth/pin');
    }
  };

  const isDisabled =
    !form.username ||
    !form.birthday ||
    !form.phoneNumber ||
    !form.agreedToTerms;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원가입</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

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
            placeholder="'-'없이 입력해주세요"
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
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    flex: 1,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
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
