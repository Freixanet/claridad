import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, Platform, Alert } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { colors, radii } from '@/constants/theme';
import { useCustomTopics } from '@/hooks/useCustomTopics';
import { isBuiltInTopic } from '@/utils/topicCatalog';

type Props = {
  selectedKeys: string[];
  onToggle: (key: string) => void;
  isPro: boolean;
};

export default function TopicPicker({ selectedKeys, onToggle, isPro }: Props) {
  const { catalog, customTopics, createTopic, removeTopic } = useCustomTopics();
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicLabel, setNewTopicLabel] = useState('');
  const [creating, setCreating] = useState(false);

  const customKeySet = useMemo(
    () => new Set(customTopics.map((topic) => topic.key)),
    [customTopics]
  );

  const handleCreateTopic = async () => {
    const trimmed = newTopicLabel.trim();
    if (!trimmed || creating) return;

    if (!isPro) {
      Alert.alert(
        'Claridad Pro',
        'Custom topics are available on Claridad Pro. Enable Preview Pro in Settings.'
      );
      return;
    }

    setCreating(true);
    try {
      const topic = await createTopic(trimmed);
      if (!selectedKeys.includes(topic.key)) {
        onToggle(topic.key);
      }
      setNewTopicLabel('');
      setShowNewTopic(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch {
      Alert.alert('Could not create topic', 'Try a different name.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTopic = (key: string, label: string) => {
    if (!isPro || isBuiltInTopic(key)) return;

    const confirmDelete = () => {
      void (async () => {
        const ok = await removeTopic(key);
        if (!ok) return;
        if (selectedKeys.includes(key)) {
          onToggle(key);
        }
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        }
      })();
    };

    const title = `Delete “${label}”?`;
    const message =
      'This topic will be removed from your filters. Existing documents keep their current tags.';

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        confirmDelete();
      }
      return;
    }

    // Defer so the dialog presents above the bottom sheet Modal.
    setTimeout(() => {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]);
    }, 0);
  };

  const renderTopicPill = (key: string, meta: { label: string; dot: string }) => {
    const active = selectedKeys.includes(key);
    const isCustom = customKeySet.has(key);
    const showDelete = isPro && isCustom;

    return (
      <View
        key={key}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: radii.full,
          borderWidth: 1,
          borderColor: active ? colors.primary : colors.borderGhost,
          backgroundColor: active ? colors.primarySoft : colors.background,
        }}
      >
        <Pressable
          onPress={() => onToggle(key)}
          onLongPress={showDelete ? () => handleDeleteTopic(key, meta.label) : undefined}
          delayLongPress={350}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingLeft: 12,
            paddingRight: showDelete ? 4 : 12,
            paddingVertical: 8,
            borderRadius: radii.full,
            backgroundColor: pressed && !active ? colors.canvasMuted : 'transparent',
          })}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: meta.dot,
            }}
          />
          <Text
            style={{
              fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
              fontSize: 13,
              color: active ? colors.primary : colors.foreground,
            }}
          >
            {meta.label}
          </Text>
        </Pressable>
        {showDelete ? (
          <Pressable
            onPress={() => handleDeleteTopic(key, meta.label)}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 24,
              height: 24,
              marginRight: 4,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? '#FEE2E2' : 'transparent',
            })}
          >
            <X color={colors.foregroundSoft} size={12} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {Object.entries(catalog).map(([key, meta]) => renderTopicPill(key, meta))}
      </View>

      {isPro ? (
        <View style={{ marginTop: 12 }}>
          {showNewTopic ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                value={newTopicLabel}
                onChangeText={setNewTopicLabel}
                placeholder="New topic name"
                placeholderTextColor={colors.foregroundSoft}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => void handleCreateTopic()}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.borderGhost,
                  borderRadius: radii.sm,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: colors.foreground,
                  backgroundColor: colors.canvasMuted,
                }}
              />
              <Pressable
                onPress={() => void handleCreateTopic()}
                disabled={creating || newTopicLabel.trim().length === 0}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: radii.sm,
                  backgroundColor:
                    creating || newTopicLabel.trim().length === 0
                      ? colors.borderGhost
                      : pressed
                        ? colors.primaryHover
                        : colors.primary,
                })}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 13,
                    color: '#FFFFFF',
                  }}
                >
                  Add
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowNewTopic(false);
                  setNewTopicLabel('');
                }}
                hitSlop={8}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 13,
                    color: colors.foregroundMuted,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowNewTopic(true)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                alignSelf: 'flex-start',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: radii.full,
                borderWidth: 1,
                borderColor: colors.borderGhost,
                borderStyle: 'dashed',
                backgroundColor: pressed ? colors.canvasMuted : colors.background,
              })}
            >
              <Plus color={colors.primary} size={14} strokeWidth={2.4} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 13,
                  color: colors.primary,
                }}
              >
                New topic
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}
