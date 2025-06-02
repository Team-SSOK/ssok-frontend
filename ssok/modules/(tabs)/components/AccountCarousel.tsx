import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { RegisteredAccount } from '@/modules/account/api/accountApi';
import AccountCard from './AccountCard';
import AddAccountCard from './AddAccountCard';

const { width: screenWidth } = Dimensions.get('window');

interface AccountCarouselProps {
  accounts: RegisteredAccount[];
  onAccountPress: (accountId: number) => void;
  onAddAccountPress: () => void;
}

export default function AccountCarousel({
  accounts,
  onAccountPress,
  onAddAccountPress,
}: AccountCarouselProps) {
  // carousel 데이터 준비 - 계좌들 + 추가 연동 버튼
  const carouselData = [...accounts, { isAddButton: true }];

  const renderCarouselItem = ({ 
    item, 
    index 
  }: { 
    item: RegisteredAccount | { isAddButton: boolean }, 
    index: number 
  }) => {
    // 계좌 추가 연동 버튼인 경우
    if ('isAddButton' in item && item.isAddButton) {
      return <AddAccountCard onPress={onAddAccountPress} />;
    }

    // 일반 계좌 카드인 경우
    const account = item as RegisteredAccount;
    return (
      <AccountCard
        account={account}
        balance={account.balance || 0}
        onPress={() => onAccountPress(account.accountId)}
      />
    );
  };

  return (
    <Carousel
      loop={false}
      width={screenWidth - 40}
      height={200}
      data={carouselData}
      style={styles.carousel}
      snapEnabled={true}
      pagingEnabled={true}
      renderItem={renderCarouselItem}
    />
  );
}

const styles = StyleSheet.create({
  carousel: {
    width: screenWidth,
  },
}); 