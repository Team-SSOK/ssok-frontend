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
  PIN_ENABLED: 'pinEnabled',
};

// 에러 메시지
export const ERROR_MESSAGES = {
  // 회원가입 관련
  REQUIRED_USERNAME: '이름을 입력해주세요.',
  REQUIRED_BIRTH_DATE: '생년월일을 입력해주세요.',
  INVALID_BIRTH_DATE: '유효하지 않은 생년월일입니다.',
  REQUIRED_PHONE: '휴대폰 번호를 입력해주세요.',
  INVALID_PHONE: '올바르지 않은 휴대폰 번호입니다.',
  PHONE_VERIFICATION_REQUIRED: '휴대폰 인증을 완료해주세요.',
  REQUIRED_VERIFICATION_CODE: '인증번호를 입력해주세요.',
  INVALID_VERIFICATION_CODE: '인증번호가 올바르지 않습니다.',
  TERMS_AGREEMENT_REQUIRED: '서비스 이용약관에 동의해주세요.',

  // API 관련
  API_ERROR: '서버와의 통신 중 오류가 발생했습니다.',
  SEND_CODE_ERROR: '인증번호 발송 중 오류가 발생했습니다.',
  VERIFY_CODE_ERROR: '인증번호 확인 중 오류가 발생했습니다.',
  REGISTRATION_ERROR: '회원가입 처리 중 오류가 발생했습니다.',

  // 새로 추가되는 메시지들
  MISSING_USER_INFO:
    '회원가입에 필요한 사용자 정보가 없습니다. 다시 시도해주세요.',
  SIGNUP_FAILED: '회원가입에 실패했습니다.',
  SIGNUP_ERROR: '회원가입 중 오류가 발생했습니다.',
  PIN_MISMATCH: 'PIN 번호가 일치하지 않습니다.',
  PIN_LOGIN_ATTEMPT_LIMIT:
    'PIN 번호를 3회 이상 잘못 입력하셨습니다. 앱을 다시 시작하거나 PIN을 재설정해주세요.',
  USER_ID_NOT_FOUND: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.',
  LOGIN_FAILED: '로그인에 실패했습니다. 사용자 정보나 PIN을 확인해주세요.',
  LOGIN_ERROR: '로그인 중 오류가 발생했습니다.',
};

// 성공 메시지
export const SUCCESS_MESSAGES = {
  CODE_SENT: '인증번호가 발송되었습니다.',
  CODE_VERIFIED: '휴대폰 인증이 완료되었습니다.',
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
