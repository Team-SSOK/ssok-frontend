import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

/**
 * 튜토리얼 단계 타입
 */
export type TutorialStep = 
  | 'swipe'           // AccountCard 스와이프 안내
  | 'longPress'       // 길게 누르기로 주계좌 변경
  | 'transfer'        // 송금 탭 안내
  | 'settings';       // 설정 탭 안내

/**
 * 튜토리얼 상태 인터페이스
 */
interface TutorialState {
  // 상태
  hasSeenHomeTutorial: boolean;
  currentStep: TutorialStep | null;
  isActive: boolean;

  // 액션
  startHomeTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
  shouldShowHomeTutorial: (accountCount: number) => boolean;
}

/**
 * 튜토리얼 단계 순서
 */
const TUTORIAL_STEPS: TutorialStep[] = ['swipe', 'longPress', 'transfer', 'settings'];

/**
 * 튜토리얼 관리 스토어
 */
export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      hasSeenHomeTutorial: false,
      currentStep: null,
      isActive: false,

      /**
       * 홈 튜토리얼 시작
       */
      startHomeTutorial: () => {
        const currentState = get();
        console.log('[DEBUG][tutorialStore] startHomeTutorial 호출됨:', {
          현재상태: {
            hasSeenHomeTutorial: currentState.hasSeenHomeTutorial,
            isActive: currentState.isActive,
            currentStep: currentState.currentStep,
          }
        });
        
        // 이미 진행 중이거나 이미 본 경우 중복 시작 방지
        if (currentState.isActive) {
          console.log('[LOG][tutorialStore] 튜토리얼 이미 진행 중 - 시작 취소');
          return;
        }
        
        if (currentState.hasSeenHomeTutorial) {
          console.log('[LOG][tutorialStore] 튜토리얼 이미 완료됨 - 시작 취소');
          return;
        }
        
        console.log('[LOG][tutorialStore] 홈 튜토리얼 시작');
        set({
          isActive: true,
          currentStep: TUTORIAL_STEPS[0],
        });
        
        // 설정 후 상태 확인
        const newState = get();
        console.log('[DEBUG][tutorialStore] 설정 완료 후 상태:', {
          isActive: newState.isActive,
          currentStep: newState.currentStep,
        });
      },

      /**
       * 다음 단계로 이동
       */
      nextStep: () => {
        const { currentStep } = get();
        if (!currentStep) return;

        const currentIndex = TUTORIAL_STEPS.indexOf(currentStep);
        const nextIndex = currentIndex + 1;

        if (nextIndex < TUTORIAL_STEPS.length) {
          console.log(`[LOG][tutorialStore] 다음 단계: ${TUTORIAL_STEPS[nextIndex]}`);
          set({ currentStep: TUTORIAL_STEPS[nextIndex] });
        } else {
          // 마지막 단계 완료
          get().completeTutorial();
        }
      },

      /**
       * 튜토리얼 건너뛰기
       */
      skipTutorial: () => {
        console.log('[LOG][tutorialStore] 튜토리얼 건너뛰기');
        set({
          isActive: false,
          currentStep: null,
          hasSeenHomeTutorial: true,
        });
      },

      /**
       * 튜토리얼 완료
       */
      completeTutorial: () => {
        console.log('[LOG][tutorialStore] 튜토리얼 완료');
        set({
          isActive: false,
          currentStep: null,
          hasSeenHomeTutorial: true,
        });
        
        // 완료 후 상태 확인
        setTimeout(() => {
          const state = get();
          console.log('[DEBUG][tutorialStore] 완료 후 상태:', {
            hasSeenHomeTutorial: state.hasSeenHomeTutorial,
            isActive: state.isActive,
            currentStep: state.currentStep,
          });
        }, 100);
      },

      /**
       * 튜토리얼 리셋 (개발/테스트용)
       */
      resetTutorial: () => {
        console.log('[LOG][tutorialStore] 튜토리얼 리셋');
        
        // 상태 초기화
        set({
          hasSeenHomeTutorial: false,
          currentStep: null,
          isActive: false,
        });
        
        // AsyncStorage에서도 직접 삭제
        AsyncStorage.removeItem('tutorial-storage').then(() => {
          console.log('[LOG][tutorialStore] AsyncStorage 삭제 완료');
        }).catch((error) => {
          Toast.show({
            type: 'error',
            text1: 'AsyncStorage 삭제 실패',
            text2: '저장된 튜토리얼 데이터 삭제에 실패했습니다.',
            position: 'bottom',
          });
        });
        
        // 설정 후 상태 확인
        setTimeout(() => {
          const state = get();
          console.log('[DEBUG][tutorialStore] 리셋 후 상태:', {
            hasSeenHomeTutorial: state.hasSeenHomeTutorial,
            isActive: state.isActive,
            currentStep: state.currentStep,
          });
        }, 100);
      },

      /**
       * 홈 튜토리얼을 보여줄지 결정
       * @param accountCount 현재 계좌 개수
       * @returns 튜토리얼 표시 여부
       */
      shouldShowHomeTutorial: (accountCount: number) => {
        const { hasSeenHomeTutorial, isActive } = get();
        
        console.log('[DEBUG][tutorialStore] shouldShowHomeTutorial 체크:', {
          accountCount,
          hasSeenHomeTutorial,
          isActive,
        });
        
        // 이미 튜토리얼을 본 경우 또는 진행 중인 경우
        if (hasSeenHomeTutorial || isActive) return false;
        
        // 계좌가 하나라도 있으면 표시 (기존: accountCount === 1)
        return accountCount === 1;
      },
    }),
    {
      name: 'tutorial-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => {
          if (value === undefined) {
            return key === 'hasSeenHomeTutorial' ? false : null;
          }
          return value;
        },
        replacer: (key, value) => {
          if (value === undefined) {
            return key === 'hasSeenHomeTutorial' ? false : null;
          }
          return value;
        },
      }),
      partialize: (state) => ({
        hasSeenHomeTutorial: state.hasSeenHomeTutorial || false,
      }),
      onRehydrateStorage: () => {
        console.log('[LOG][tutorialStore] AsyncStorage로부터 튜토리얼 상태 복원');
        return (restoredState, error) => {
          if (error) {
            Toast.show({
              type: 'error',
              text1: 'AsyncStorage 복원 오류',
              text2: '저장된 튜토리얼 데이터 복원에 실패했습니다.',
              position: 'bottom',
            });
          } else {
            console.log('[LOG][tutorialStore] 튜토리얼 상태 복원 완료:', restoredState);
          }
        };
      },
    },
  ),
); 