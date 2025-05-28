// 컴포넌트 exports
export {
  OnboardingScreen,
  OnboardingItem,
  PaginationDots,
  OnboardingButton,
} from './components';

// 훅 exports
export { useOnboarding } from './hooks';

// 타입 exports
export type {
  SlideData,
  MediaType,
  OnboardingItemProps,
  PaginationDotsProps,
  OnboardingButtonProps,
  UseOnboardingReturn,
} from './types/index';

// 데이터 exports
export { slideData } from './utils/slides';
