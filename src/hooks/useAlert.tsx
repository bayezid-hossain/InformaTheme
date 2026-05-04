import React, { createContext, useContext, useState, useCallback } from 'react';
import { InformaAlert, AlertButton } from '../components/InformaAlert';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
}

interface AlertContextType {
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = useCallback((title: string, message: string, buttons: AlertButton[] = [{ text: 'OK' }]) => {
    setState({ visible: true, title, message, buttons });
  }, []);

  const hideAlert = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <InformaAlert
        visible={state.visible}
        title={state.title}
        message={state.message}
        buttons={state.buttons}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
