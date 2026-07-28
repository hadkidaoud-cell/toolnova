// ============================================================
// ToolNova Store
// ============================================================

import { create } from "zustand";
import type { Theme } from "@/types";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system",
  setTheme: (theme) => set({ theme }),
}));

interface SearchState {
  query: string;
  isOpen: boolean;
  setQuery: (query: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  isOpen: false,
  setQuery: (query) => set({ query }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));

interface UIState {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
