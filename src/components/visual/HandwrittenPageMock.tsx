import { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { palette } from '@/design/tokens';

type HandwrittenPageMockProps = {
  lines?: number;
  ink?: string;
  tone?: 'light' | 'aged';
  style?: ViewStyle;
  compact?: boolean;
};

/** Deterministic pseudo-random in [0,1) so the page looks stable across renders. */
function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type Stroke = { width: number; ml: number };

/**
 * Simulates a page of dense handwriting using small ink strokes grouped into
 * "words" and "lines". No real text — purely a visual mock built from Views.
 */
export function HandwrittenPageMock({
  lines = 13,
  ink = palette.ink.primary,
  tone = 'light',
  style,
  compact = false,
}: HandwrittenPageMockProps) {
  const rows = useMemo(() => {
    const result: { strokes: Stroke[]; indent: number; tilt: number; isGap: boolean }[] = [];
    for (let i = 0; i < lines; i++) {
      const r = seeded(i + 1);
      // Occasional short line = end of paragraph, sometimes a blank gap.
      const isGap = seeded(i * 3.3 + 7) > 0.86;
      if (isGap) {
        result.push({ strokes: [], indent: 0, tilt: 0, isGap: true });
        continue;
      }
      const wordCount = 3 + Math.floor(seeded(i * 1.7 + 2) * 4);
      const strokes: Stroke[] = [];
      for (let w = 0; w < wordCount; w++) {
        const wr = seeded(i * 10 + w + 0.5);
        strokes.push({
          width: 14 + wr * 46,
          ml: w === 0 ? 0 : 5 + seeded(i * 5 + w) * 5,
        });
      }
      result.push({
        strokes,
        indent: r > 0.7 ? 14 : 0,
        tilt: (seeded(i * 2.1 + 4) - 0.5) * 1.4,
        isGap: false,
      });
    }
    return result;
  }, [lines]);

  const inkSoft = tone === 'aged' ? palette.ink.soft : ink;

  return (
    <View style={[styles.page, style]}>
      {rows.map((row, i) =>
        row.isGap ? (
          <View key={i} style={compact ? styles.gapCompact : styles.gap} />
        ) : (
          <View
            key={i}
            style={[
              styles.line,
              compact && styles.lineCompact,
              { marginLeft: row.indent, transform: [{ rotate: `${row.tilt}deg` }] },
            ]}
          >
            {row.strokes.map((s, j) => (
              <View
                key={j}
                style={{
                  width: s.width,
                  marginLeft: s.ml,
                  height: compact ? 3 : 4,
                  borderRadius: 3,
                  backgroundColor: j % 3 === 0 ? ink : inkSoft,
                  opacity: 0.62 + seeded(i * 9 + j) * 0.3,
                }}
              />
            ))}
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    gap: 9,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineCompact: {
    marginVertical: 0,
  },
  gap: {
    height: 12,
  },
  gapCompact: {
    height: 7,
  },
});
