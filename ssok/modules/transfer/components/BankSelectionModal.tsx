import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { Bank, banks } from '../../../mock/bankData';

interface BankSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBank: (bank: Bank) => void;
  selectedBankId?: string;
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({
  visible,
  onClose,
  onSelectBank,
  selectedBankId,
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
        style={[styles.bankItem, isSelected && styles.selectedBankItem]}
        onPress={() => {
          onSelectBank(item);
          onClose();
        }}
      >
        {renderBankLogo(item)}
        <Text style={styles.bankName}>{item.name}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>은행 선택</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={banks}
          renderItem={renderBankItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bankList}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  bankList: {
    padding: 16,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.silver,
  },
  selectedBankItem: {
    backgroundColor: colors.silver + '40', // 40% 투명도
  },
  bankLogo: {
    width: 36,
    height: 36,
    marginRight: 16,
    borderRadius: 8,
  },
  bankIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bankName: {
    fontSize: 16,
    flex: 1,
  },
});

export default BankSelectionModal;
