import { BaseToast } from 'react-native-toast-message';

// Toast 커스텀 설정 - warning 타입 추가
const toastConfig = {
    /*
      warning 타입 추가 - BaseToast를 기반으로 노란색 스타일 적용
    */
    warning: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#f39c12', backgroundColor: '#fff3cd' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontWeight: '600',
          color: '#856404',
        }}
        text2Style={{
          fontSize: 13,
          color: '#856404',
        }}
      />
    ),
  };

export default toastConfig;
