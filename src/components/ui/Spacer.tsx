import { View } from 'react-native';

import { spacing } from '@/design/tokens';

type SpacerSize = keyof typeof spacing;

type SpacerProps = {
  size?: SpacerSize;
  horizontal?: boolean;
};

export function Spacer({ size = 'md', horizontal = false }: SpacerProps) {
  const value = spacing[size];

  return (
    <View
      style={
        horizontal ? { width: value } : { height: value }
      }
    />
  );
}
