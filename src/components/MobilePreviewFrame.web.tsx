import { ReactNode } from 'react';
import { View, useWindowDimensions, type ViewStyle } from 'react-native';

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;
/** Match scripts/patch-gh-pages-index.mjs — frame only on desktop-like widths */
const DESKTOP_PREVIEW_MIN_WIDTH = 520;

const outerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: '#111827',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 24,
  paddingHorizontal: 16,
};

const phoneStyle: ViewStyle = {
  width: PHONE_WIDTH,
  maxWidth: '100%',
  height: PHONE_HEIGHT,
  maxHeight: '100%',
  backgroundColor: '#FFFFFF',
  borderRadius: 28,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#374151',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
  paddingBottom: 6,
};

const fullScreenStyle: ViewStyle = {
  flex: 1,
  backgroundColor: '#FFFFFF',
};

export default function MobilePreviewFrame({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const showDesktopPreview = width >= DESKTOP_PREVIEW_MIN_WIDTH;

  if (!showDesktopPreview) {
    return <View style={fullScreenStyle}>{children}</View>;
  }

  return (
    <View style={outerStyle}>
      <View style={phoneStyle}>{children}</View>
    </View>
  );
}
