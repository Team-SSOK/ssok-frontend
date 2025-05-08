import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  ImageSourcePropType,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GRID_PADDING = 16;
const GRID_WIDTH = width - GRID_PADDING * 2;
const ITEM_WIDTH = GRID_WIDTH / COLUMN_COUNT;
const MINIMUM_TOUCH_SIZE = 44;

interface BankItem {
  id: string;
  name: string;
  icon: ImageSourcePropType;
  color?: string;
}

interface BankSelectModalProps {
  visible: boolean;
  banks: BankItem[];
  selectedBankId?: string | null;
  onSelect: (bankId: string) => void;
  onClose: () => void;
}

const BankSelectModal: React.FC<BankSelectModalProps> = ({
  visible,
  banks,
  selectedBankId,
  onSelect,
  onClose,
}) => {
  // 애니메이션 값
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 모달이 보일 때 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 모달이 닫힐 때 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  const bottomSheetTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  const renderBankItem = (bank: BankItem, index: number) => {
    const isSelected = bank.id === selectedBankId;

    return (
      <TouchableOpacity
        key={bank.id}
        style={[
          styles.bankItem,
          isSelected && styles.selectedBankItem,
          // 마지막 열 아이템의 오른쪽 마진 제거
          (index + 1) % COLUMN_COUNT === 0 && styles.lastColumnItem,
        ]}
        onPress={() => onSelect(bank.id)}
        activeOpacity={0.7}
      >
        <View style={styles.bankIconWrapper}>
          {typeof bank.icon === 'number' ? (
            <Image source={bank.icon} style={styles.bankIcon} />
          ) : (
            <View
              style={[
                styles.defaultIconContainer,
                bank.color ? { backgroundColor: bank.color } : null,
              ]}
            >
              <Ionicons name="business-outline" size={24} color="white" />
            </View>
          )}
        </View>
        <Text
          style={[styles.bankName, isSelected && styles.selectedBankName]}
          numberOfLines={1}
        >
          {bank.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleModalClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleModalClose}
    >
      <TouchableWithoutFeedback onPress={handleModalClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheet,
                { transform: [{ translateY: bottomSheetTranslateY }] },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.handleBar} />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleModalClose}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.black} />
                </TouchableOpacity>
              </View>

              <Text style={styles.title}>은행을 선택해주세요</Text>

              <ScrollView
                contentContainerStyle={styles.banksContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.bankGrid}>
                  {banks.map((bank, index) => renderBankItem(bank, index))}
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.silver,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
    minWidth: MINIMUM_TOUCH_SIZE,
    minHeight: MINIMUM_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
    color: colors.black,
  },
  banksContainer: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 24,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  bankItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
    minWidth: MINIMUM_TOUCH_SIZE,
    minHeight: MINIMUM_TOUCH_SIZE,
  },
  lastColumnItem: {
    marginRight: 0,
  },
  selectedBankItem: {
    opacity: 1,
  },
  bankIconWrapper: {
    marginBottom: 8,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.black,
  },
  selectedBankName: {
    fontWeight: '600',
    color: colors.primary,
  },
});

export default BankSelectModal;
