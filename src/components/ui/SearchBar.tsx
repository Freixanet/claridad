import { Search } from 'lucide-react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { palette, radius, spacing } from '@/design/tokens';
import { fontSize } from '@/design/typography';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar documentos',
}: SearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Search color={palette.text.tertiary} size={18} strokeWidth={1.75} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.text.tertiary}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.background.elevated,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border.subtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    color: palette.text.primary,
    padding: 0,
    margin: 0,
  },
});
