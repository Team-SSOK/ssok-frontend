import { useState } from 'react';

interface UsePinOptions {
  maxLength?: number;
  onComplete?: (pin: string) => void;
}

export const usePinInput = ({
  maxLength = 6,
  onComplete,
}: UsePinOptions = {}) => {
  const [inputPin, setInputPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePressNumber = (num: number) => {
    if (inputPin.length < maxLength) {
      const newPin = inputPin + num;
      setInputPin(newPin);

      // PIN 입력이 완료되면 콜백 실행
      if (newPin.length === maxLength && onComplete) {
        onComplete(newPin);
      }
    }
  };

  const handleDelete = () => {
    setInputPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const resetPin = () => {
    setInputPin('');
  };

  const setError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => {
      resetPin();
    }, 500);
  };

  const clearError = () => {
    setErrorMessage('');
  };

  return {
    inputPin,
    errorMessage,
    isComplete: inputPin.length === maxLength,
    resetPin,
    setError,
    clearError,
    handlePressNumber,
    handleDelete,
  };
};

export default usePinInput;
