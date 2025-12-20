export const CATEGORY_COLOR = {
  cafe: "var(--color-cat-cafe)",
  park: "var(--color-cat-park)",
  gaming: "var(--color-cat-gaming)",
  food: "var(--color-cat-food)",
  hangout: "var(--color-cat-hangout)",
  other: "var(--color-cat-other)",
} as const;

export type CategoryColor = typeof CATEGORY_COLOR;
