import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Trash2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { colors, radii } from '@/constants/theme';
import TopicPicker from '@/components/TopicPicker';
import type { CustomLibraryCategory } from '@/storage/libraryCategories';

type Props = {
  visible: boolean;
  category: CustomLibraryCategory | null;
  isPro: boolean;
  onClose: () => void;
  onSave: (category: CustomLibraryCategory) => void;
  onDelete: (id: string) => void;
};

export default function LibraryTabSettingsSheet({
  visible,
  category,
  isPro,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [label, setLabel] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible || !category) return;
    setLabel(category.label);
    setSelectedKeys(category.categoryKeys);
    setConfirmingDelete(false);
  }, [category, visible]);

  const toggleKey = (key: string) => {
    setSelectedKeys((current) =>
      current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]
    );
  };

  const handleSave = () => {
    if (!category) return;
    const trimmed = label.trim();
    if (!trimmed || selectedKeys.length === 0) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    onSave({
      ...category,
      label: trimmed,
      categoryKeys: selectedKeys,
    });
    onClose();
  };

  const handleDeletePress = () => {
    if (!category) return;
    setConfirmingDelete(true);
  };

  const handleConfirmDelete = () => {
    if (!category) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    onDelete(category.id);
    onClose();
  };

  const canSave = label.trim().length > 0 && selectedKeys.length > 0;

  if (!category) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.35)' }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 28 : 20,
            maxHeight: '82%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderGhost,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: colors.foreground,
                letterSpacing: -0.2,
              }}
            >
              Tab settings
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? colors.canvasMuted : colors.background,
                borderWidth: 1,
                borderColor: colors.borderGhost,
              })}
            >
              <X color={colors.foreground} size={16} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                color: colors.foregroundMuted,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              Tab name
            </Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Work, Shopping"
              placeholderTextColor={colors.foregroundSoft}
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: colors.borderGhost,
                borderRadius: radii.sm,
                paddingHorizontal: 12,
                paddingVertical: 11,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: colors.foreground,
                backgroundColor: colors.canvasMuted,
              }}
            />

            <Text
              style={{
                marginTop: 18,
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                color: colors.foregroundMuted,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              Included topics
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12.5,
                color: colors.foregroundMuted,
                marginTop: 4,
                lineHeight: 18,
              }}
            >
              Pages appear in this tab when they contain at least one matching section category.
            </Text>

            <TopicPicker selectedKeys={selectedKeys} onToggle={toggleKey} isPro={isPro} />
          </ScrollView>

          <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 10 }}>
            {confirmingDelete ? (
              <>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13.5,
                    color: colors.foregroundMuted,
                    lineHeight: 20,
                    textAlign: 'center',
                    marginBottom: 2,
                  }}
                >
                  {`Delete “${category.label}”? This filter tab will be removed from your library.`}
                </Text>
                <Pressable
                  onPress={handleConfirmDelete}
                  style={({ pressed }) => ({
                    borderRadius: radii.sm,
                    paddingVertical: 13,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    backgroundColor: pressed ? '#FEE2E2' : '#FEF2F2',
                  })}
                >
                  <Trash2 color={colors.danger} size={16} strokeWidth={2.2} />
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: colors.danger,
                    }}
                  >
                    Delete tab
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setConfirmingDelete(false)}
                  style={({ pressed }) => ({
                    borderRadius: radii.sm,
                    paddingVertical: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: pressed ? colors.canvasMuted : colors.background,
                  })}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: colors.foreground,
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={handleSave}
                  disabled={!canSave}
                  style={({ pressed }) => ({
                    backgroundColor: !canSave
                      ? colors.borderGhost
                      : pressed
                        ? colors.primaryHover
                        : colors.primary,
                    borderRadius: radii.sm,
                    paddingVertical: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: '#FFFFFF',
                    }}
                  >
                    Save changes
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDeletePress}
                  style={({ pressed }) => ({
                    borderRadius: radii.sm,
                    paddingVertical: 13,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    backgroundColor: pressed ? '#FEF2F2' : colors.background,
                  })}
                >
                  <Trash2 color={colors.danger} size={16} strokeWidth={2.2} />
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: colors.danger,
                    }}
                  >
                    Delete tab
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
