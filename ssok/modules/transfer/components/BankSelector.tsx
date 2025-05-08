import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Bank, banks } from '../../../mock/bankData';
import { Ionicons } from '@expo/vector-icons';
import BankSelectModal from './BankSelectModal';

interface BankSelectorProps {
  selectedBankId: string | null;
  onBankSelect: (bank: Bank) => void;
}

// BankSelectModal에서 사용할 은행 아이템 타입 정의
interface BankModalItem {
  id: string;
  name: string;
  icon: ImageSourcePropType;
  color?: string;
}

const BankSelector: React.FC<BankSelectorProps> = ({
  selectedBankId,
  onBankSelect,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 선택된 은행 찾기
  const selectedBank = banks.find((bank) => bank.id === selectedBankId);

  // 모달에서 은행 선택 처리
  const handleBankSelect = (bankId: string) => {
    const bank = banks.find((b) => b.id === bankId);
    if (bank) {
      onBankSelect(bank);
    }
    setIsModalVisible(false);
  };

  // 은행 로고 또는 아이콘 렌더링
  const renderBankLogo = (bank: Bank) => {
    if (bank.logoSource) {
      return <Image source={bank.logoSource} style={styles.bankLogo} />;
    } else if (bank.icon) {
      return (
        <View
          style={[styles.bankIconContainer, { backgroundColor: bank.color }]}
        >
          <Ionicons name={bank.icon} size={24} color={colors.white} />
        </View>
      );
    }
    // 둘 다 없을 경우 기본 아이콘
    return (
      <View style={[styles.bankIconContainer, { backgroundColor: bank.color }]}>
        <Ionicons name="business-outline" size={24} color={colors.white} />
      </View>
    );
  };

  // 모달에 전달할 은행 아이템 데이터 변환
  const modalBanks: BankModalItem[] = banks.map((bank) => {
    // 로고가 있으면 로고를 사용하고, 없으면 기본 아이콘 이미지로 대체
    let icon: ImageSourcePropType;
    if (bank.logoSource) {
      icon = bank.logoSource;
    } else {
      icon = require('@/assets/banks/default.png');
    }

    return {
      id: bank.id,
      name: bank.name,
      icon,
      color: bank.color,
    };
  });

  return (
    <View>
      {/* 드롭다운 스타일의 은행 선택기 */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsModalVisible(true)}
      >
        {selectedBank ? (
          <View style={styles.selectedBankContainer}>
            {renderBankLogo(selectedBank)}
            <Text style={styles.selectedBankName}>{selectedBank.name}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>은행 선택</Text>
        )}
        <Ionicons name="chevron-down" size={24} color={colors.lGrey} />
      </TouchableOpacity>

      {/* 은행 선택 Bottom Sheet 모달 */}
      <BankSelectModal
        visible={isModalVisible}
        banks={modalBanks}
        selectedBankId={selectedBankId}
        onSelect={handleBankSelect}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderColor: colors.silver,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  selectedBankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.lGrey,
    fontSize: 18,
  },
  selectedBankName: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.black,
  },
  bankLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  bankIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BankSelector;
