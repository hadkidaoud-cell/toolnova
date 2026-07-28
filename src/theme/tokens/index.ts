// ============================================================
// ToolNova Theme Tokens
// ============================================================

export const designTokens = {
  colors: {
    brand: {
      primary: "var(--color-brand-primary)",
      hover: "var(--color-brand-hover)",
    },
    neutral: {
      background: "var(--color-bg)",
      foreground: "var(--color-fg)",
      card: "var(--color-card)",
      border: "var(--color-border)",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  transitions: {
    fast: "150ms ease",
    normal: "200ms ease",
    slow: "300ms ease",
  },
} as const;
