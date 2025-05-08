# 폰트 사용 가이드

이 프로젝트에서는 카카오(Kakao) 폰트를 전역적으로 사용합니다. 이 가이드는 폰트를 일관되게 적용하는 방법을 설명합니다.

## 기본 사용법

모든 텍스트 컴포넌트에서는 React Native의 기본 `Text` 대신 커스텀 `Text` 컴포넌트를 사용해야 합니다:

```jsx
import { Text } from '@/components/TextProvider';

// 사용 예시
<Text>일반 텍스트</Text>;
```

## 타이포그래피 스타일 적용

일관된 텍스트 스타일을 위해 미리 정의된 타이포그래피 스타일을 사용합니다:

```jsx
import { Text } from '@/components/TextProvider';
import { typography } from '@/theme/typography';

// 사용 예시
<Text style={typography.h1}>제목</Text>
<Text style={typography.body1}>본문 텍스트</Text>
<Text style={typography.button}>버튼 텍스트</Text>
```

## 사용 가능한 타이포그래피 스타일

- `h1`, `h2`, `h3`: 헤더/제목 텍스트
- `body1`, `body2`: 본문 텍스트
- `label`: 라벨, 작은 헤더
- `button`: 버튼 텍스트
- `caption`: 작은 텍스트, 설명글
- `captionBold`: 강조된 작은 텍스트
- `light`: 가벼운 스타일의 텍스트
- `highlight`: 강조 텍스트

## 사용 가능한 폰트 패밀리

이 프로젝트에는 다음과 같은 카카오 폰트가 포함되어 있습니다:

- `KakaoBigSans`: Regular, Bold, ExtraBold
- `KakaoSmallSans`: Light, Regular, Bold

`fontFamily` 객체를 통해 직접 폰트 패밀리에 접근할 수 있습니다:

```jsx
import { fontFamily } from '@/utils/loadFonts';

// 사용 예시
<Text style={{ fontFamily: fontFamily.bold }}>볼드 텍스트</Text>
<Text style={{ fontFamily: fontFamily.smallRegular }}>작은 텍스트</Text>
```

## 스타일 커스터마이징

기본 타이포그래피 스타일과 함께 추가 스타일을 적용할 수 있습니다:

```jsx
<Text style={[typography.body1, { color: colors.primary }]}>
  색상이 변경된 본문
</Text>
```

## 새로운 컴포넌트 개발 시

새로운 컴포넌트를 개발할 때는 반드시 커스텀 `Text` 컴포넌트를 사용하고, 가능한 미리 정의된 타이포그래피 스타일을 활용하세요. 이를 통해 앱 전체에서 일관된 텍스트 스타일을 유지할 수 있습니다.

## WooridaumR.ttf 폰트 추가 방법

현재 프로젝트에는 WooridaumB.ttf만 포함되어 있습니다. WooridaumR.ttf 폰트를 추가하려면:

1. `assets/fonts/` 디렉토리에 폰트 파일을 복사합니다.
2. `utils/loadFonts.ts` 파일에서 주석 처리된 부분을 해제합니다.
3. `fontFamily.regular`를 'WooridaumR'로 변경합니다.
4. 앱을 다시 시작합니다.
