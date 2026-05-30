import type { ReactNode } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { colors, radii } from '@/constants/theme';

type Variant = 'outline' | 'soft' | 'status';

type PillProps = {
  label: string;
  variant?: Variant;
  dotColor?: string;
  icon?: ReactNode;
  style?: ViewStyle;
  textSelectable?: boolean;
};

export default function Pill({
  label,
  variant = 'outline',
  dotColor,
  icon,
  style,
  textSelectable = true,
}: PillProps) {
  const base: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 6,
    alignSelf: 'flex-start',
  };

  if (variant === 'soft') {
    return (
      <View style={[base, { backgroundColor: colors.primarySoft }, style]}>
        {icon}
        <Text
          selectable={textSelectable}
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
            color: colors.primary,
            letterSpacing: -0.1,
          }}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        base,
        {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.borderGhost,
        },
        style,
      ]}
    >
      {dotColor ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: dotColor,
          }}
        />
      ) : null}
      {icon}
      <Text
        selectable={textSelectable}
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: colors.foreground,
          letterSpacing: -0.1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
