import { useState, useCallback, useMemo } from 'react';
import { REGEX, ERROR_MESSAGES } from '../utils/constants';

/**
 * 회원가입 폼 데이터 인터페이스
 */
export interface RegisterFormData {
  username: string;
  birthDate: string;
  phoneNumber: string;
  verificationCode: string;
  agreedToTerms: boolean;
}

/**
 * 폼 유효성 검증 오류 인터페이스
 */
export interface FormErrors {
  username?: string;
  birthDate?: string;
  phoneNumber?: string;
  verificationCode?: string;
  terms?: string;
}

/**
 * 회원가입 폼 상태와 유효성 검증을 관리하는 커스텀 훅
 *
 * 폼 입력값, 유효성 검증, 에러 메시지 등을 관리합니다.
 *
 * @example
 * ```tsx
 * const {
 *   form,
 *   errors,
 *   handleChange,
 *   validateForm,
 *   isFormComplete
 * } = useRegisterForm();
 *
 * // 폼 상태 사용
 * <TextInput
 *   value={form.username}
 *   onChangeText={(text) => handleChange('username', text)}
 *   error={errors.username}
 * />
 * ```
 */
export const useRegisterForm = () => {
  // 폼 상태 초기화
  const [form, setForm] = useState<RegisterFormData>({
    username: '',
    birthDate: '',
    phoneNumber: '',
    verificationCode: '',
    agreedToTerms: false,
  });

  // 에러 상태 초기화
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * 휴대폰 번호 형식 변환 (하이픈 추가)
   * 이 함수는 자식 컴포넌트에 전달되지 않고 내부에서만 사용되므로 useCallback 불필요
   */
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const digits = value.replace(/[^0-9]/g, '');
    let formattedPhoneNumber = '';

    if (digits.length <= 3) {
      formattedPhoneNumber = digits;
    } else if (digits.length <= 7) {
      formattedPhoneNumber = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      formattedPhoneNumber = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }

    return formattedPhoneNumber;
  };

  /**
   * 폼 필드 값 변경 핸들러
   * 이 함수는 컴포넌트에 prop으로 전달되므로 useCallback 유지
   */
  const handleChange = useCallback(
    (key: keyof RegisterFormData, value: string | boolean) => {
      // 휴대폰 번호에 대한 특별 처리
      if (key === 'phoneNumber' && typeof value === 'string') {
        setForm((prev) => ({
          ...prev,
          phoneNumber: formatPhoneNumber(value),
        }));
      } else {
        setForm((prev) => ({ ...prev, [key]: value }));
      }

      // 입력 시 해당 필드 에러 초기화
      if (errors[key as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    },
    [errors, formatPhoneNumber],
  );

  /**
   * 휴대폰 번호 유효성 검증
   * 단순 내부 유틸리티 함수이므로 useCallback 제거
   */
  const validatePhone = (): boolean => {
    const digits = form.phoneNumber.replace(/[^0-9]/g, '');

    if (!digits) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: ERROR_MESSAGES.REQUIRED_PHONE,
      }));
      return false;
    } else if (!REGEX.PHONE_NUMBER.test(digits)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: ERROR_MESSAGES.INVALID_PHONE,
      }));
      return false;
    }
    return true;
  };

  /**
   * 인증 코드 유효성 검증
   * 단순 내부 유틸리티 함수이므로 useCallback 제거
   */
  const validateVerificationCode = (): boolean => {
    if (!form.verificationCode.trim()) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: ERROR_MESSAGES.REQUIRED_VERIFICATION_CODE,
      }));
      return false;
    }
    return true;
  };

  /**
   * 전체 폼 유효성 검증
   * 이 함수는 외부 컴포넌트에 prop으로 전달되므로 useCallback 유지
   */
  const validateForm = useCallback(
    (requireVerification: boolean = true): boolean => {
      const newErrors: FormErrors = {};
      const phoneDigits = form.phoneNumber.replace(/[^0-9]/g, '');

      // 이름 검증
      if (!form.username.trim()) {
        newErrors.username = ERROR_MESSAGES.REQUIRED_USERNAME;
      }

      // 생년월일 검증
      if (!form.birthDate.trim()) {
        newErrors.birthDate = ERROR_MESSAGES.REQUIRED_BIRTH_DATE;
      } else if (!REGEX.BIRTH_DATE.test(form.birthDate)) {
        newErrors.birthDate = ERROR_MESSAGES.INVALID_BIRTH_DATE;
      }

      // 휴대폰 번호 검증 (숫자만으로 유효성 검사)
      if (!phoneDigits) {
        newErrors.phoneNumber = ERROR_MESSAGES.REQUIRED_PHONE;
      } else if (!REGEX.PHONE_NUMBER.test(phoneDigits)) {
        newErrors.phoneNumber = ERROR_MESSAGES.INVALID_PHONE;
      }

      // 필요한 경우 휴대폰 인증 요구
      if (requireVerification && !newErrors.phoneNumber) {
        // 다른 오류가 없을 때만 인증 필요 오류 추가
        newErrors.phoneNumber = ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED;
      }

      // 약관 동의 검증
      if (!form.agreedToTerms) {
        newErrors.terms = ERROR_MESSAGES.TERMS_REQUIRED;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [form],
  );

  /**
   * 폼이 제출 가능한지 확인
   * 단순 계산 함수이므로 useCallback 제거
   */
  const isFormComplete = (verificationConfirmed: boolean): boolean => {
    return !!(
      form.username &&
      form.birthDate &&
      form.phoneNumber &&
      form.agreedToTerms &&
      verificationConfirmed
    );
  };

  /**
   * 폼 상태 초기화
   * 단순 내부 함수이므로 useCallback 제거
   */
  const resetForm = () => {
    setForm({
      username: '',
      birthDate: '',
      phoneNumber: '',
      verificationCode: '',
      agreedToTerms: false,
    });
    setErrors({});
  };

  return {
    form,
    errors,
    handleChange,
    validatePhone,
    validateVerificationCode,
    validateForm,
    isFormComplete,
    resetForm,
    setErrors,
  };
};

export default useRegisterForm;
