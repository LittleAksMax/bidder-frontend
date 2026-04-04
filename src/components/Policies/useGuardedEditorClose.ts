import { useEffect, useRef } from 'react';

type GuardedEditorCloseHandlers = {
  handleEditorFocusCapture: () => void;
  handleEditorBlurCapture: () => void;
  handleGuardedClose: () => void;
};

const useGuardedEditorClose = (show: boolean, onClose: () => void): GuardedEditorCloseHandlers => {
  const editorFocusedRef = useRef<boolean>(false);
  const editorBlurTimeoutRef = useRef<number | null>(null);

  useEffect((): (() => void) => {
    return () => {
      if (editorBlurTimeoutRef.current !== null) {
        window.clearTimeout(editorBlurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!show) {
      editorFocusedRef.current = false;
      if (editorBlurTimeoutRef.current !== null) {
        window.clearTimeout(editorBlurTimeoutRef.current);
        editorBlurTimeoutRef.current = null;
      }
    }
  }, [show]);

  const handleEditorFocusCapture = (): void => {
    if (editorBlurTimeoutRef.current !== null) {
      window.clearTimeout(editorBlurTimeoutRef.current);
      editorBlurTimeoutRef.current = null;
    }
    editorFocusedRef.current = true;
  };

  const handleEditorBlurCapture = (): void => {
    if (editorBlurTimeoutRef.current !== null) {
      window.clearTimeout(editorBlurTimeoutRef.current);
    }
    editorBlurTimeoutRef.current = window.setTimeout(() => {
      editorFocusedRef.current = false;
      editorBlurTimeoutRef.current = null;
    }, 0);
  };

  const handleGuardedClose = (): void => {
    if (editorFocusedRef.current) {
      return;
    }
    onClose();
  };

  return {
    handleEditorFocusCapture,
    handleEditorBlurCapture,
    handleGuardedClose,
  };
};

export default useGuardedEditorClose;
