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
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleSettings = () => {
    // 설정 기능 구현
  };

  const handleRegister = () => {
    // 회원가입 기능 구현
    if (name && birthdate && phoneNumber && agreedToTerms) {
      // 유효성 검사 후 회원가입 처리
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원가입</Text>
        <TouchableOpacity
          onPress={handleSettings}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 이름 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>이름</Text>
          <TextInput
            style={styles.input}
            placeholder="이름을 입력해주세요"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* 생년월일 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>생년월일</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY.MM.DD"
            value={birthdate}
            onChangeText={setBirthdate}
            keyboardType="numeric"
          />
        </View>

        {/* 휴대폰 번호 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>휴대폰 번호</Text>
          <TextInput
            style={styles.input}
            placeholder="'-'로 구분해주세요"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        {/* 약관 동의 */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <Ionicons
            name={agreedToTerms ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={agreedToTerms ? colors.primary : colors.grey}
          />
          <Text style={styles.termsText}>약관 동의</Text>
        </TouchableOpacity>

        {/* 회원가입 버튼 */}
        <Button
          title="회원가입"
          variant={
            !name || !birthdate || !phoneNumber || !agreedToTerms
              ? 'disabled'
              : 'primary'
          }
          size="large"
          onPress={handleRegister}
          disabled={!name || !birthdate || !phoneNumber || !agreedToTerms}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
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
