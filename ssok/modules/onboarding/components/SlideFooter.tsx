import React from 'react';
import { View, StyleSheet } from 'react-native';
import Pagination from './Pagination';

interface SlideFooterProps {
  showPagination: boolean;
  isLastSlide: boolean;
  dataLength: number;
  currentSlide: number;
  onPageChange: (index: number) => void;
  PaginationComponent?: React.ReactNode;
  EndComponent?: React.ReactNode;
  SkipComponent?: React.ReactNode;
  showSkip: boolean;
}

/**
 * 슬라이드 하단 영역 컴포넌트
 * 페이지네이션과 버튼 렌더링 담당
 */
const SlideFooter: React.FC<SlideFooterProps> = ({
  showPagination,
  isLastSlide,
  dataLength,
  currentSlide,
  onPageChange,
  PaginationComponent,
  EndComponent,
  SkipComponent,
  showSkip,
}) => (
  <View style={styles.footerContainer}>
    {showPagination &&
      !isLastSlide &&
      (PaginationComponent || (
        <Pagination
          total={dataLength}
          current={currentSlide}
          onPageChange={onPageChange}
        />
      ))}

    {showSkip && !isLastSlide && SkipComponent}
    {isLastSlide && EndComponent}
  </View>
);

const styles = StyleSheet.create({
  footerContainer: {
    paddingBottom: 40,
  },
});

export default React.memo(SlideFooter);
