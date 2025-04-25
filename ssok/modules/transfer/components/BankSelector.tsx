import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Bank, banks } from '../../../mock/bankData';
import { Ionicons } from '@expo/vector-icons';

interface BankSelectorProps {
  selectedBankId: string | null;
  onBankSelect: (bank: Bank) => void;
}

const BankSelector: React.FC<BankSelectorProps> = ({
  selectedBankId,
  onBankSelect,
}) => {
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

  const renderBankItem = ({ item }: { item: Bank }) => {
    const isSelected = item.id === selectedBankId;

    return (
      <TouchableOpacity
        style={[styles.bankOption, isSelected && styles.selectedBankOption]}
        onPress={() => onBankSelect(item)}
      >
        {renderBankLogo(item)}
        <Text
          style={[styles.bankName, isSelected && styles.selectedBankName]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>은행 선택</Text>

      <FlatList
        data={banks}
        renderItem={renderBankItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={false}
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
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bankOption: {
    alignItems: 'center',
    width: '30%',
    padding: 8,
    borderRadius: 8,
  },
  selectedBankOption: {
    backgroundColor: colors.silver, // 40% 투명도
  },
  bankLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  bankIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bankName: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.black,
  },
  selectedBankName: {
    fontWeight: '600',
  },
});

export default BankSelector;
