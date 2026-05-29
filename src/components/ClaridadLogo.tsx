import { Image } from 'expo-image';
import { ImageStyle, StyleProp } from 'react-native';

type ClaridadLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export default function ClaridadLogo({ size = 28, style }: ClaridadLogoProps) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[{ width: size, height: size, borderRadius: size * 0.22 }, style]}
      contentFit="cover"
      accessibilityLabel="Claridad logo"
    />
  );
}
