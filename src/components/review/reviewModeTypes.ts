export const REVIEW_MODES = ['split', 'source', 'structured'] as const;

export type ReviewMode = (typeof REVIEW_MODES)[number];

export type ReviewModeOption = {
  key: ReviewMode;
  label: string;
};

export const REVIEW_MODE_OPTIONS: ReviewModeOption[] = [
  { key: 'split', label: 'Split' },
  { key: 'source', label: 'Original' },
  { key: 'structured', label: 'Structured' },
];

export function reviewModeIndex(mode: ReviewMode): number {
  return REVIEW_MODES.indexOf(mode);
}

export function reviewModeFromIndex(index: number): ReviewMode {
  return REVIEW_MODES[Math.min(REVIEW_MODES.length - 1, Math.max(0, index))];
}
