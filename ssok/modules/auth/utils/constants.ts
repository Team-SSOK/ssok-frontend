/**
 * 인증 관련 상수들
 */

// 정규식
export const REGEX = {
  // 휴대폰 번호: 01로 시작하는 10-11자리 숫자
  PHONE_NUMBER: /^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/,

  // 생년월일: YYYY.MM.DD 형식 또는 YYYYMMDD 형식
  BIRTH_DATE: /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,

  // 인증번호: 6자리 숫자
  VERIFICATION_CODE: /^\d{6}$/,

  // PIN 번호: 6자리 숫자
  PIN_CODE: /^\d{6}$/,
};

// AsyncStorage 키
export const STORAGE_KEYS = {
  USERNAME: 'username',
  BIRTH_DATE: 'birthDate',
  PHONE_NUMBER: 'phoneNumber',
  USER_ID: 'userId',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
};

// 에러 메시지
export const ERROR_MESSAGES = {
  // 회원가입 관련
  REQUIRED_USERNAME: '이름을 입력해주세요',
  REQUIRED_BIRTH_DATE: '생년월일을 입력해주세요',
  INVALID_BIRTH_DATE: 'YYYYMMDD 형식으로 입력해주세요',
  REQUIRED_PHONE: '휴대폰 번호를 입력해주세요',
  INVALID_PHONE: '올바른 휴대폰 번호를 입력해주세요',
  PHONE_VERIFICATION_REQUIRED: '휴대폰 인증이 필요합니다',
  REQUIRED_VERIFICATION_CODE: '인증번호를 입력해주세요',
  INVALID_VERIFICATION_CODE: '인증번호가 올바르지 않습니다',

  // API 관련
  API_ERROR: '서버와의 통신 중 오류가 발생했습니다',
  SEND_CODE_ERROR: '인증번호 발송 중 오류가 발생했습니다',
  VERIFY_CODE_ERROR: '인증번호 확인 중 오류가 발생했습니다',
  REGISTRATION_ERROR: '회원가입 중 오류가 발생했습니다',
};

// 성공 메시지
export const SUCCESS_MESSAGES = {
  CODE_SENT: '휴대폰으로 인증번호가 발송되었습니다',
  CODE_VERIFIED: '휴대폰 인증이 완료되었습니다',
};

// 상태 관리 액션 타입
export const ACTION_TYPES = {
  START_LOADING: 'START_LOADING',
  STOP_LOADING: 'STOP_LOADING',
  SET_VERIFICATION_SENT: 'SET_VERIFICATION_SENT',
  SET_VERIFICATION_CONFIRMED: 'SET_VERIFICATION_CONFIRMED',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET: 'RESET',
};
