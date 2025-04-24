import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PinContextType {
  pin: string;
  setPin: (pin: string) => void;
  clearPin: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export const PinProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [pin, setPinState] = useState<string>('');
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(false);

  const setPin = (newPin: string) => {
    setPinState(newPin);
  };

  const clearPin = () => {
    setPinState('');
  };

  const setIsLoggedIn = (loggedIn: boolean) => {
    setIsLoggedInState(loggedIn);
  };

  return (
    <PinContext.Provider
      value={{ pin, setPin, clearPin, isLoggedIn, setIsLoggedIn }}
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
