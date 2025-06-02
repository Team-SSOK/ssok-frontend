import React, { useRef } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { RegisteredAccount } from '@/modules/account/api/accountApi';
import { colors } from '@/constants/colors';
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
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  
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

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={ref}
        loop={false}
        width={screenWidth}
        height={200}
        data={carouselData}
        style={styles.carousel}
        snapEnabled={true}
        pagingEnabled={true}
        onProgressChange={progress}
        renderItem={renderCarouselItem}
      />
      
      {carouselData.length > 1 && (
        <Pagination.Basic
          progress={progress}
          data={carouselData}
          dotStyle={styles.inactiveDot}
          activeDotStyle={styles.activeDot}
          containerStyle={styles.paginationContainer}
          onPress={onPressPagination}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  carousel: {
    width: screenWidth,
  },
  paginationContainer: {
    gap: 8,
    marginTop: 12,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.disabled,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
}); 