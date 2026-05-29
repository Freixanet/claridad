import { Text, TextProps, TextStyle } from 'react-native';

import { textVariants, type TextVariant } from '@/design/typography';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
};

export function AppText({
  variant = 'body',
  style,
  color,
  ...rest
}: AppTextProps) {
  const variantStyle = textVariants[variant] as TextStyle;

  return (
    <Text
      style={[variantStyle, color ? { color } : null, style]}
      {...rest}
    />
  );
}
