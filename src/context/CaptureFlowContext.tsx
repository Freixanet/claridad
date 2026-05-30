import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

type CaptureFlowContextValue = {
  stashCaptureUri: (uri: string) => void;
  takeCaptureUri: () => string | null;
  peekCaptureUri: () => string | null;
};

const CaptureFlowContext = createContext<CaptureFlowContextValue | null>(null);

export function CaptureFlowProvider({ children }: { children: ReactNode }) {
  const uriRef = useRef<string | null>(null);

  const stashCaptureUri = useCallback((uri: string) => {
    uriRef.current = uri;
  }, []);

  const takeCaptureUri = useCallback(() => {
    const uri = uriRef.current;
    uriRef.current = null;
    return uri;
  }, []);

  const peekCaptureUri = useCallback(() => uriRef.current, []);

  const value = useMemo(
    () => ({ stashCaptureUri, takeCaptureUri, peekCaptureUri }),
    [stashCaptureUri, takeCaptureUri, peekCaptureUri]
  );

  return <CaptureFlowContext.Provider value={value}>{children}</CaptureFlowContext.Provider>;
}

export function useCaptureFlow(): CaptureFlowContextValue {
  const ctx = useContext(CaptureFlowContext);
  if (!ctx) {
    throw new Error('useCaptureFlow must be used within CaptureFlowProvider');
  }
  return ctx;
}
