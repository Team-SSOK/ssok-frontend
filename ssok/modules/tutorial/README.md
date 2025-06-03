# Tutorial Module 📚

SSOK 앱의 튜토리얼 및 도움말 시스템을 제공하는 모듈입니다.

## 주요 기능

- 📖 **단계별 가이드**: 기능별 상세 튜토리얼
- 💡 **인터랙티브 도움말**: 실시간 도움말 오버레이
- 🎯 **기능 설명**: 각 기능의 사용법 안내
- 📋 **체크리스트**: 완료해야 할 작업 목록

## 구조

```
tutorial/
├── components/          # 튜토리얼 컴포넌트
├── hooks/              # 튜토리얼 관리 훅
├── stores/             # 튜토리얼 상태
├── constants/          # 튜토리얼 내용
└── types/              # 타입 정의
```

## 사용법

```tsx
import { TutorialOverlay, useTutorial } from '@/modules/tutorial';

export default function FeatureScreen() {
  const { showTutorial, completeTutorial } = useTutorial();

  return (
    <View>
      <FeatureContent />
      <TutorialOverlay
        steps={tutorialSteps}
        onComplete={completeTutorial}
      />
    </View>
  );
}
```

---

**📚 튜토리얼 관련 문의는 UX팀에 연락해주세요!** 