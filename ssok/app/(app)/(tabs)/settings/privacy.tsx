import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { router, useFocusEffect, useNavigation } from 'expo-router';

export default function PrivacyScreen() {
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          display: 'none',
        },
      });
      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            display: 'flex',
          },
        });
      };
    }, [navigation]),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </Pressable>
        <Text style={styles.title}>개인정보처리방침</Text>
        <View style={styles.rightSpace} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>최종 업데이트: 2025년 05월 07일</Text>

        {/* 개요 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개요</Text>
          <Text style={styles.paragraph}>
            SSOK(이하 '회사')은 사용자의 개인정보를 중요시하며, 개인정보보호법
            등 관련 법령을 준수하고 있습니다. 회사는 개인정보처리방침을 통해
            회사가 사용자로부터 수집하는 개인정보의 항목, 수집 및 이용 목적,
            보유 및 이용 기간, 그리고 사용자의 권리와 그 행사 방법 등을
            안내드립니다.
          </Text>
        </View>

        {/* 수집하는 개인정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수집하는 개인정보</Text>
          <Text style={styles.paragraph}>
            회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집하고 있습니다:
          </Text>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>필수 정보:</Text> 이름, 생년월일, 휴대폰
              번호, 계좌 정보(은행명, 계좌번호)
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>선택 정보:</Text> 프로필 사진
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>자동 수집 정보:</Text> IP 주소, 기기
              정보, 위치 정보, 서비스 이용 기록, 블루투스 연결 정보
            </Text>
          </View>
        </View>

        {/* 개인정보의 수집 및 이용 목적 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개인정보의 수집 및 이용 목적</Text>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              서비스 제공 및 계약 이행: 계좌 개설, 송금 서비스, 블루투스 기반
              송금 기능 등
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              회원 관리: 회원제 서비스 제공, 개인식별, 부정이용 방지 등
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              마케팅 및 광고: 신규 서비스 안내, 이벤트 정보 제공 (별도 동의
              필요)
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              안전 및 보안: 사기 거래 방지, 시스템 보안 유지
            </Text>
          </View>
        </View>

        {/* 개인정보의 보유 및 이용 기간 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개인정보의 보유 및 이용 기간</Text>
          <Text style={styles.paragraph}>
            회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당
            정보를 지체 없이 파기합니다. 단, 관련 법령에 의한 정보보존 의무가
            있는 경우, 해당 법령에서 정한 기간 동안 개인정보를 보관합니다.
          </Text>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>
                계약 또는 청약철회 등에 관한 기록:
              </Text>{' '}
              5년
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>
                대금결제 및 재화 등의 공급에 관한 기록:
              </Text>{' '}
              5년
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>
                소비자의 불만 또는 분쟁처리에 관한 기록:
              </Text>{' '}
              3년
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>전자금융거래에 관한 기록:</Text> 5년
            </Text>
          </View>
        </View>

        {/* 정보주체의 권리와 행사 방법 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보주체의 권리와 행사 방법</Text>
          <Text style={styles.paragraph}>
            사용자는 개인정보 관련하여 다음과 같은 권리를 행사할 수 있습니다:
          </Text>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              개인정보 열람, 정정 및 삭제 요청
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>개인정보 처리정지 요청</Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              개인정보 이용 및 제공 내역 열람 요청
            </Text>
          </View>

          <Text style={styles.paragraph}>
            위 권리 행사는 서비스 내 '개인정보 설정' 메뉴를 통해 직접
            수행하거나, 고객센터 또는 개인정보 보호책임자에게 서면, 전화 또는
            이메일을 통해 요청할 수 있습니다.
          </Text>
        </View>

        {/* 개인정보 보호책임자 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개인정보 보호책임자</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>이름:</Text>
            <Text style={styles.infoValue}>박재홍</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>직위:</Text>
            <Text style={styles.infoValue}>개인정보 보호책임자</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>연락처:</Text>
            <Text style={styles.infoValue}>010-3360-4104</Text>
          </View>
        </View>

        {/* 고객센터 안내 */}
        <Pressable
          style={styles.supportButton}
          onPress={() => router.push('/(app)/(tabs)/settings/support')}
        >
          <Text style={styles.supportButtonText}>개인정보 관련 문의하기</Text>
        </Pressable>
      </ScrollView>
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
  lastUpdated: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 20,
    textAlign: 'right',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.black,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.black,
    marginBottom: 10,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 15,
    marginRight: 8,
    color: colors.black,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.black,
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    width: 70,
    fontWeight: 'bold',
    color: colors.black,
  },
  infoValue: {
    fontSize: 15,
    color: colors.black,
  },
  supportButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  supportButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
