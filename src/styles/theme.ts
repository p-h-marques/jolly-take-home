import type { ShowStatus } from "@/api/types";

// Colors currently in use across components. Extend only when a new
// screen/component actually needs a color not listed here.

// Record<> instead of a loose object so a missing/renamed status is a
// compile-time error instead of a silent runtime fallback.
const badgeStatusColors: Record<ShowStatus | "all", string> = {
  all: "#66f",
  Running: "#30ad5e",
  Ended: "#fa5353",
  "To Be Determined": "#dcb412",
};

export const colors = {
  border: "#e5e7eb",
  placeholderBackground: "#cecece",
  placeholderIcon: "#858585",
  error: "#cf3535",
  primary: "#66f",
  badge: {
    status: badgeStatusColors,
    inactiveBorder: "#d1d5db",
    inactiveText: "#4b5563",
  },
} as const;
