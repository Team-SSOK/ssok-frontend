import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';

export default function SupportScreen() {
  // 문의 유형 목록
  const inquiryTypes = [
    '계정 관련',
    '송금 관련',
    '블루투스 기능',
    '앱 오류',
    '보안 문제',
    '기타',
  ];

  // 상태 관리
  const [selectedType, setSelectedType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // 문의 제출 처리
  const handleSubmit = () => {
    // 필수 입력 확인
    if (!selectedType || !title || !content) {
      Alert.alert('입력 오류', '문의 유형, 제목, 내용은 필수 입력 항목입니다.');
      return;
    }

    // 여기에서 실제 API 호출 등의 처리를 해야 함
    // 지금은 성공 알림만 표시
    Alert.alert(
      '문의가 접수되었습니다',
      '고객님의 문의가 성공적으로 접수되었습니다. 빠른 시간 내에 답변드리겠습니다.',
      [{ text: '확인', onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>고객센터</Text>
        <View style={styles.rightSpace} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          {/* 문의하기 안내 */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>문의 접수 안내</Text>
            <Text style={styles.infoText}>
              평일 09:00~18:00 접수된 문의는 당일 답변을 원칙으로 합니다.
              주말/공휴일 접수건은 다음 영업일에 순차적으로 답변 드립니다.
            </Text>
          </View>

          {/* 문의 유형 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>문의 유형*</Text>
            <View style={styles.typeContainer}>
              {inquiryTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.typeButton,
                    selectedType === type && styles.selectedType,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      selectedType === type && styles.selectedTypeText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 제목 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>제목*</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="문의 제목을 입력하세요"
              placeholderTextColor={colors.grey}
            />
          </View>

          {/* 내용 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내용*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="문의 내용을 상세히 입력해주세요"
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          {/* 회신 이메일 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>회신받을 이메일 (선택)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="회신받을 이메일 주소"
              placeholderTextColor={colors.grey}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* 문의 등록 버튼 */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>문의 등록하기</Text>
          </TouchableOpacity>

          {/* 전화 상담 안내 */}
          <View style={styles.phoneSupport}>
            <Ionicons name="call-outline" size={24} color={colors.primary} />
            <View style={styles.phoneSupportTextContainer}>
              <Text style={styles.phoneSupportTitle}>전화 상담</Text>
              <Text style={styles.phoneSupportNumber}>1588-1234</Text>
              <Text style={styles.phoneSupportInfo}>
                평일 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  backButton: {
    padding: 5,
  },
  rightSpace: {
    width: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoBox: {
    backgroundColor: colors.silver,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.black,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.silver,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedType: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: 14,
    color: colors.black,
  },
  selectedTypeText: {
    color: colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.silver,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneSupport: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.black,
    borderRadius: 8,
    marginBottom: 30,
  },
  phoneSupportTextContainer: {
    marginLeft: 15,
  },
  phoneSupportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  phoneSupportNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: 5,
  },
  phoneSupportInfo: {
    fontSize: 14,
    color: colors.white,
  },
});
