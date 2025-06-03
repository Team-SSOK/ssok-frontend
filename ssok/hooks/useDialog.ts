import { useState, useCallback } from 'react';

interface DialogState {
  visible: boolean;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const initialState: DialogState = {
  visible: false,
  title: '',
  content: '',
  confirmText: '확인',
  cancelText: '취소',
};

/**
 * Dialog 상태와 액션을 관리하는 커스텀 훅
 */
export const useDialog = () => {
  const [dialogState, setDialogState] = useState<DialogState>(initialState);

  /**
   * Dialog를 표시합니다
   */
  const showDialog = useCallback(
    ({
      title,
      content,
      confirmText = '확인',
      cancelText,
      onConfirm,
      onCancel,
    }: Omit<DialogState, 'visible'>) => {
      setDialogState({
        visible: true,
        title,
        content,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
      });
    },
    [],
  );

  /**
   * Dialog를 닫습니다
   */
  const hideDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, visible: false }));
  }, []);

  /**
   * 확인 버튼 클릭 핸들러
   */
  const handleConfirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    hideDialog();
  }, [dialogState.onConfirm, hideDialog]);

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = useCallback(() => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
    hideDialog();
  }, [dialogState.onCancel, hideDialog]);

  return {
    dialogState,
    showDialog,
    hideDialog,
    handleConfirm,
    handleCancel,
  };
};

export default useDialog;
