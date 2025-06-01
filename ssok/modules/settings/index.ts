// 설정 관련 컴포넌트들을 통합 export
export { Header } from './components/Header';
export { ProfileImage, InfoItem, Section } from './components/ProfileSection';
export { SettingItem } from './components/SettingItem';
export { Button as SettingsButton } from './components/SettingsButton';

// 도움말 관련 컴포넌트들
export {
  FAQItem,
  HelpItem,
  InfoBox,
  type FAQItemTypes,
} from './components/HelpSection';

// 개인정보처리방침 관련 컴포넌트들
export * from './components/PrivacySection';

// 고객센터 관련 컴포넌트들
export * from './components/SupportSection';
