import { useState, useCallback } from 'react';
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
   */
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, '');

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
  };

  /**
   * 폼 필드 값 변경 핸들러
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
    [errors],
  );

  /**
   * 개별 필드 유효성 검증
   */
  const validateField = (key: keyof RegisterFormData, value: any): string | undefined => {
    switch (key) {
      case 'username':
        if (!value?.trim()) {
          return ERROR_MESSAGES.REQUIRED_USERNAME;
        }
        break;
        
      case 'birthDate':
        if (!value?.trim()) {
          return ERROR_MESSAGES.REQUIRED_BIRTH_DATE;
        } else if (!REGEX.BIRTH_DATE.test(value)) {
          return ERROR_MESSAGES.INVALID_BIRTH_DATE;
        }
        break;
        
      case 'phoneNumber':
        const phoneDigits = value?.replace(/[^0-9]/g, '') || '';
        if (!phoneDigits) {
          return ERROR_MESSAGES.REQUIRED_PHONE;
        } else if (!REGEX.PHONE_NUMBER.test(phoneDigits)) {
          return ERROR_MESSAGES.INVALID_PHONE;
    }
        break;
        
      case 'agreedToTerms':
        if (!value) {
          return ERROR_MESSAGES.TERMS_AGREEMENT_REQUIRED;
        }
        break;
    }
    return undefined;
  };

  /**
   * 전체 폼 유효성 검증
   */
  const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {};

    // 각 필드 검증
    Object.keys(form).forEach((key) => {
      const fieldKey = key as keyof RegisterFormData;
      const error = validateField(fieldKey, form[fieldKey]);
      if (error) {
        newErrors[fieldKey as keyof FormErrors] = error;
      }
    });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }, [form]);

  /**
   * 폼이 제출 가능한지 확인
   */
  const isFormComplete = (): boolean => {
    return !!(
      form.username.trim() &&
      form.birthDate.trim() &&
      form.phoneNumber.trim() &&
      form.agreedToTerms
    );
  };

  /**
   * 폼 상태 초기화
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
    validateForm,
    isFormComplete,
    resetForm,
    setErrors,
  };
};

export default useRegisterForm;
