import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import AuthStorage from '@/services/AuthStorage';

interface PinContextType {
  pin: string;
  setPin: (pin: string) => void;
  clearPin: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  isLoading: boolean;
  saveUserRegistration: (phoneNumber: string, pin: string) => Promise<void>;
  verifyAndLogin: (inputPin: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export const PinProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [pin, setPinState] = useState<string>('');
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 앱 시작 시 사용자 등록 상태 확인
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const isRegistered = await AuthStorage.isUserRegistered();
        // 사용자가 등록되어 있다면 앱 시작 시 자동으로 로그인 상태로 설정하지 않음
        // PIN 확인 화면을 거쳐야 함
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking registration status:', error);
        setIsLoading(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  const setPin = (newPin: string) => {
    setPinState(newPin);
  };

  const clearPin = () => {
    setPinState('');
  };

  const setIsLoggedIn = (loggedIn: boolean) => {
    setIsLoggedInState(loggedIn);
  };

  // 사용자 등록 정보 저장 (회원가입 완료 시)
  const saveUserRegistration = async (phoneNumber: string, pin: string) => {
    try {
      console.log('[LOG] 사용자 회원 가입 정보 저장');
      console.log('[LOG] phoneNumber: ', phoneNumber, 'PIN: ', pin);
      await AuthStorage.saveUserInfo(phoneNumber, pin);
      setPinState(pin);
    } catch (error) {
      console.error('Error saving user registration:', error);
    }
  };

  // PIN 번호 확인 및 로그인
  const verifyAndLogin = async (inputPin: string) => {
    try {
      const isValid = await AuthStorage.verifyPin(inputPin);
      if (isValid) {
        setIsLoggedInState(true);
      }
      return isValid;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await AuthStorage.logout();
      setIsLoggedInState(false);
      setPinState('');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <PinContext.Provider
      value={{
        pin,
        setPin,
        clearPin,
        isLoggedIn,
        setIsLoggedIn,
        isLoading,
        saveUserRegistration,
        verifyAndLogin,
        logout,
      }}
    >
      {children}
    </PinContext.Provider>
  );
};

export const usePin = (): PinContextType => {
  const context = useContext(PinContext);
  if (context === undefined) {
    throw new Error('usePin must be used within a PinProvider');
  }
  return context;
};

export default PinContext;
