import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  Platform,
  StyleSheet,
} from 'react-native';
import { Archive, Pin, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii } from '@/constants/theme';
import { setWebSelectionBlocked } from '@/hooks/useWebLongPress';
import { clearWebTextSelection, webNoSelectStyle } from '@/utils/webNoSelect';

export const libraryActionSheetClassName = 'library-action-sheet';

type Props = {
  visible: boolean;
  docTitle: string;
  pinned: boolean;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
};

function ActionRow({
  icon,
  label,
  hint,
  destructive,
  onPress,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  destructive?: boolean;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: pressed ? colors.canvasMuted : colors.background,
        borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: colors.borderGhost,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: destructive ? '#FEF2F2' : colors.canvasMuted,
          borderWidth: 1,
          borderColor: destructive ? '#FECACA' : colors.borderGhost,
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          selectable={false}
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 15,
            color: destructive ? colors.danger : colors.foreground,
            letterSpacing: -0.2,
          }}
        >
          {label}
        </Text>
        {hint ? (
          <Text
            selectable={false}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: colors.foregroundMuted,
              marginTop: 2,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function LibraryDocActionSheet({
  visible,
  docTitle,
  pinned,
  onPin,
  onArchive,
  onDelete,
  onClose,
}: Props) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(12)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) {
      setConfirmingDelete(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setWebSelectionBlocked(false);
      return;
    }

    setWebSelectionBlocked(true);
    clearWebTextSelection();

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      const raf = requestAnimationFrame(() => clearWebTextSelection());
      const timer = window.setTimeout(() => clearWebTextSelection(), 50);
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(timer);
        setWebSelectionBlocked(false);
      };
    }

    return () => setWebSelectionBlocked(false);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 26,
          stiffness: 420,
          mass: 0.7,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(12);
      sheetOpacity.setValue(0);
    }
  }, [visible, backdropOpacity, sheetOpacity, sheetTranslateY]);

  const handlePin = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    onPin();
  };

  const handleArchive = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    onArchive();
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setConfirmingDelete(true);
  };

  const handleConfirmDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    onDelete();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={{
              ...StyleSheet.absoluteFill,
              backgroundColor: 'rgba(17, 24, 39, 0.42)',
              opacity: backdropOpacity,
            }}
          />
        </Pressable>

        <Animated.View
          style={{
            paddingHorizontal: 16,
            paddingBottom: Platform.OS === 'ios' ? 34 : 20,
            opacity: sheetOpacity,
            transform: [{ translateY: sheetTranslateY }],
            ...webNoSelectStyle,
          }}
          {...(Platform.OS === 'web' ? { className: libraryActionSheetClassName } : {})}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            {...(Platform.OS === 'web' ? { className: libraryActionSheetClassName } : {})}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.borderGhost,
                overflow: 'hidden',
                marginBottom: 10,
                shadowColor: '#111827',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 24,
                elevation: 8,
                ...webNoSelectStyle,
              }}
            >
              <View
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 18,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.borderGhost,
                  backgroundColor: confirmingDelete ? '#FEF2F2' : colors.canvasSubtle,
                }}
              >
                {confirmingDelete ? (
                  <View style={{ alignItems: 'center', gap: 10 }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: '#FEE2E2',
                        borderWidth: 1,
                        borderColor: '#FECACA',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 color={colors.danger} size={20} strokeWidth={2} />
                    </View>
                    <Text
                      selectable={false}
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 17,
                        color: colors.foreground,
                        letterSpacing: -0.3,
                        textAlign: 'center',
                      }}
                    >
                      ¿Eliminar esta página?
                    </Text>
                    <Text
                      selectable={false}
                      numberOfLines={2}
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 13,
                        color: colors.foregroundMuted,
                        textAlign: 'center',
                        lineHeight: 18,
                      }}
                    >
                      "{docTitle}" se borrará permanentemente. Esta acción no se puede deshacer.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text
                      numberOfLines={2}
                      selectable={false}
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 16,
                        color: colors.foreground,
                        letterSpacing: -0.25,
                        textAlign: 'center',
                      }}
                    >
                      {docTitle}
                    </Text>
                    <Text
                      selectable={false}
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: colors.foregroundMuted,
                        textAlign: 'center',
                        marginTop: 4,
                      }}
                    >
                      Elige una acción
                    </Text>
                  </>
                )}
              </View>

              {confirmingDelete ? (
                <>
                  <Pressable
                    onPress={handleConfirmDelete}
                    style={({ pressed }) => ({
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      backgroundColor: pressed ? '#B91C1C' : colors.danger,
                      alignItems: 'center',
                    })}
                  >
                    <Text
                      selectable={false}
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 16,
                        color: '#FFFFFF',
                        letterSpacing: -0.2,
                      }}
                    >
                      Eliminar permanentemente
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setConfirmingDelete(false)}
                    style={({ pressed }) => ({
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      backgroundColor: pressed ? colors.canvasMuted : colors.background,
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: colors.borderGhost,
                      alignItems: 'center',
                    })}
                  >
                    <Text
                      selectable={false}
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 15,
                        color: colors.foreground,
                      }}
                    >
                      Volver
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
              <ActionRow
                icon={
                  <Pin
                    color={colors.warning}
                    size={18}
                    strokeWidth={2}
                    fill={pinned ? colors.warning : 'transparent'}
                  />
                }
                label={pinned ? 'Quitar pin' : 'Pin'}
                hint={pinned ? 'Dejar de destacar en Pinned' : 'Destacar en la pestaña Pinned'}
                onPress={handlePin}
              />
              <ActionRow
                icon={<Archive color={colors.foreground} size={18} strokeWidth={2} />}
                label="Archivar"
                hint="Ocultar de la biblioteca sin eliminar"
                onPress={handleArchive}
              />
              <ActionRow
                icon={<Trash2 color={colors.danger} size={18} strokeWidth={2} />}
                label="Eliminar"
                hint="Borrar permanentemente"
                destructive
                onPress={handleDelete}
                isLast
              />
                </>
              )}
            </View>

            {!confirmingDelete ? (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.canvasMuted : colors.background,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.borderGhost,
                paddingVertical: 16,
                alignItems: 'center',
              })}
            >
              <Text
                selectable={false}
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: colors.foreground,
                  letterSpacing: -0.2,
                }}
              >
                Cancelar
              </Text>
            </Pressable>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
