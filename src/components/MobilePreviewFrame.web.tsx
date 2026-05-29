import { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;

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

export default function MobilePreviewFrame({ children }: { children: ReactNode }) {
  return (
    <View style={outerStyle}>
      <View style={phoneStyle}>{children}</View>
    </View>
  );
}
