import { useState, useCallback } from 'react';
import { REGEX, ERROR_MESSAGES } from '../utils/constants';

// 폼 상태 인터페이스
export interface RegisterFormData {
  username: string;
  birthDate: string;
  phoneNumber: string;
  verificationCode: string;
  agreedToTerms: boolean;
}

// 폼 에러 인터페이스
export interface FormErrors {
  username?: string;
  birthDate?: string;
  phoneNumber?: string;
  verificationCode?: string;
}

/**
 * 회원가입 폼 상태와 유효성 검증을 관리하는 커스텀 훅
 */
export const useRegisterForm = () => {
  // 폼 상태
  const [form, setForm] = useState<RegisterFormData>({
    username: '',
    birthDate: '',
    phoneNumber: '',
    verificationCode: '',
    agreedToTerms: false,
  });

  // 에러 상태
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * 폼 필드 값 변경 핸들러
   */
  const handleChange = (
    key: keyof RegisterFormData,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    // 입력 시 해당 필드 에러 초기화
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  /**
   * 휴대폰 번호 유효성 검증
   */
  const validatePhone = (): boolean => {
    if (!form.phoneNumber.trim()) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: ERROR_MESSAGES.REQUIRED_PHONE,
      }));
      return false;
    } else if (!REGEX.PHONE_NUMBER.test(form.phoneNumber)) {
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
   */
  const validateForm = (requireVerification: boolean = true): boolean => {
    const newErrors: FormErrors = {};

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

    // 휴대폰 번호 검증
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = ERROR_MESSAGES.REQUIRED_PHONE;
    } else if (!REGEX.PHONE_NUMBER.test(form.phoneNumber)) {
      newErrors.phoneNumber = ERROR_MESSAGES.INVALID_PHONE;
    }

    // 필요한 경우 휴대폰 인증 요구
    if (requireVerification && !newErrors.phoneNumber) {
      // 다른 오류가 없을 때만 인증 필요 오류 추가
      newErrors.phoneNumber = ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 폼이 제출 가능한지 확인
   */
  const isFormComplete = useCallback(
    (verificationConfirmed: boolean): boolean => {
      return !!(
        form.username &&
        form.birthDate &&
        form.phoneNumber &&
        form.agreedToTerms &&
        verificationConfirmed
      );
    },
    [form],
  );

  return {
    form,
    errors,
    handleChange,
    validatePhone,
    validateVerificationCode,
    validateForm,
    isFormComplete,
    setErrors,
  };
};

export default useRegisterForm;
