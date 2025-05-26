import React, { useState } from 'react';
import { StyleSheet, Text, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';
import {
  Header,
  Section,
  InfoBox,
  HelpItem,
  Button,
  FAQItem,
  FAQItemTypes,
} from '@/modules/settings';

const INITIAL_FAQS: FAQItemTypes[] = [
  {
    question: '블루투스 송금은 어떻게 하나요?',
    answer:
      '상대방과 같은 공간에 있을 때, 홈 화면의 블루투스 레이더를 통해 상대방의 기기를 발견하면 해당 아이콘을 탭하여 송금할 수 있습니다.',
    isExpanded: false,
  },
  {
    question: '송금 한도는 얼마인가요?',
    answer:
      '기본 송금 한도는 일 100만원, 월 500만원입니다. 추가 인증을 통해 한도를 상향 조정할 수 있습니다.',
    isExpanded: false,
  },
  {
    question: '계정을 삭제하려면 어떻게 해야 하나요?',
    answer:
      '계정 삭제는 고객센터로 문의해 주세요. 담당자가 확인 후 처리해 드립니다.',
    isExpanded: false,
  },
  {
    question: '송금 수수료는 얼마인가요?',
    answer:
      '친구 간 소액 송금은 무료입니다. 대규모 송금이나 사업자 계좌 송금 시에는 소정의 수수료가 부과될 수 있습니다.',
    isExpanded: false,
  },
  {
    question: '송금 취소는 어떻게 하나요?',
    answer:
      '송금 후 상대방이 확인하기 전까지는 송금 내역에서 취소할 수 있습니다. 상대방이 이미 확인한 경우에는 고객센터로 문의해 주세요.',
    isExpanded: false,
  },
];

export default function HelpScreen() {
  // FAQ 데이터
  const [faqs, setFaqs] = useState<FAQItemTypes[]>(INITIAL_FAQS);

  // FAQ 항목 토글 함수
  const toggleFAQ = (index: number) => {
    setFaqs((prev) =>
      prev.map((faq, i) =>
        i === index ? { ...faq, isExpanded: !faq.isExpanded } : faq,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="도움말" />

      <ScrollView style={styles.content}>
        {/* 검색 기능 안내 */}
        <InfoBox>
          <Text style={styles.searchInfoText}>
            자주 묻는 질문을 확인하시거나 고객센터에 문의하세요.
          </Text>
        </InfoBox>

        {/* FAQ 섹션 */}
        <Section title="자주 묻는 질문 (FAQ)">
          {faqs.map((faq, index) => (
            <FAQItem key={index} item={faq} onToggle={() => toggleFAQ(index)} />
          ))}
        </Section>

        {/* 추가 도움말 섹션 */}
        <Section title="앱 기능 안내">
          <HelpItem
            icon="bluetooth"
            title="블루투스 송금"
            description="근처 친구에게 쉽게 송금하기"
          />
          <HelpItem
            icon="wallet-outline"
            title="계좌 관리"
            description="내 계좌 확인 및 관리하기"
          />
        </Section>

        {/* 고객 지원 안내 */}
        <Button
          label="고객센터에 문의하기"
          onPress={() => router.push('/(app)/(tabs)/settings/support')}
          style={styles.supportButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchInfoText: {
    fontSize: 14,
    color: colors.black,
    textAlign: 'center',
  },
  supportButton: {
    marginTop: 10,
    marginBottom: 30,
  },
});
