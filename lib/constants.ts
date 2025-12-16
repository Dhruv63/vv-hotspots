export const CATEGORY_COLOR = {
  cafe: "#0ABDC6",
  park: "#00FF9F",
  gaming: "#EA00D9",
  food: "#FFCC00",
  hangout: "#BD00FF",
  other: "#00B8FF",
} as const;

export type CategoryColor = typeof CATEGORY_COLOR;
