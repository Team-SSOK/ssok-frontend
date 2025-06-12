import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { colors } from '@/constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 툴팁 위치 타입
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * 툴팁 props 타입
 */
interface TutorialTooltipProps {
  visible: boolean;
  title: string;
  message: string;
  position: TooltipPosition;
  targetX: number;
  targetY: number;
  targetWidth: number;
  targetHeight: number;
  onNext?: () => void;
  onSkip?: () => void;
  onClose?: () => void;
  nextButtonText?: string;
  skipButtonText?: string;
  showNextButton?: boolean;
  showSkipButton?: boolean;
}

/**
 * 튜토리얼 툴팁 컴포넌트
 */
export default function TutorialTooltip({
  visible,
  title,
  message,
  position,
  targetX,
  targetY,
  targetWidth,
  targetHeight,
  onNext,
  onSkip,
  onClose,
  nextButtonText = '다음',
  skipButtonText = '건너뛰기',
  showNextButton = true,
  showSkipButton = true,
}: TutorialTooltipProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 4방향 오버레이 - 하이라이트 영역만 투명하게 */}
      <View style={styles.overlayContainer}>
        {/* 상단 오버레이 */}
        <View
          style={[
            styles.overlaySection,
            {
              top: 0,
              left: 0,
              right: 0,
              height: targetY + 20, // 하이라이트 영역 시작점 - 4픽셀
            },
          ]}
        />
        
        {/* 좌측 오버레이 */}
        <View
          style={[
            styles.overlaySection,
            {
              top: targetY + 20, // 하이라이트 영역과 맞춤
              left: 0,
              width: targetX - 4,
              height: targetHeight + 8,
            },
          ]}
        />
        
        {/* 우측 오버레이 */}
        <View
          style={[
            styles.overlaySection,
            {
              top: targetY + 20, // 하이라이트 영역과 맞춤
              left: targetX + targetWidth + 4,
              right: 0,
              height: targetHeight + 8,
            },
          ]}
        />
        
        {/* 하단 오버레이 */}
        <View
          style={[
            styles.overlaySection,
            {
              top: targetY + 20 + targetHeight + 8, // 하이라이트 영역 끝점 + 4픽셀
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />

        {/* 하이라이트된 영역 (투명) */}
        <View
          style={[
            styles.highlight,
            {
              position: 'absolute',
              left: targetX - 4,
              top: targetY + 20,
              width: targetWidth + 8,
              height: targetHeight + 8,
            },
          ]}
        />

        {/* 툴팁 컨테이너 - 화면 가운데 고정 */}
        <View style={styles.tooltipContainer}>
          {/* 툴팁 콘텐츠 */}
          <View style={styles.tooltipContent}>
            <Text style={styles.tooltipTitle}>{title}</Text>
            <Text style={styles.tooltipMessage}>{message}</Text>

            {/* 액션 버튼들 */}
            <View style={styles.buttonContainer}>
              {showSkipButton && (
                <Pressable
                  style={[styles.button, styles.skipButton]}
                  onPress={onSkip}
                >
                  <Text style={styles.skipButtonText}>{skipButtonText}</Text>
                </Pressable>
              )}

              {showNextButton && (
                <Pressable
                  style={[styles.button, styles.nextButton]}
                  onPress={onNext}
                >
                  <Text style={styles.nextButtonText}>{nextButtonText}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
  },
  overlaySection: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  highlight: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tooltipContent: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    maxWidth: screenWidth - 40,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  tooltipMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButton: {
    backgroundColor: colors.white,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
}); 