export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "insp-theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}
