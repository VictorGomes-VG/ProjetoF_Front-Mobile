import * as SecureStore from "expo-secure-store";
import { DevSettings } from "react-native";
import { useSyncExternalStore } from "react";

export type ThemeName = "friends" | "midnight" | "sunset";

const STORAGE_KEY = "friendszone.theme";

const themes = {
  friends: {
    colors: {
      background: "#FFF8F2",
      backgroundSoft: "#FFF3E8",
      surface: "#FFFFFF",
      surfaceAlt: "#FFF4EC",
      surfaceMuted: "#F8EDE3",
      primary: "#0B5ED7",
      primarySoft: "#E6F0FF",
      secondary: "#F26B5E",
      secondarySoft: "#FFE2DB",
      accent: "#1FA971",
      accentSoft: "#E8F7EE",
      text: "#172033",
      textMuted: "#6B7280",
      textSoft: "#8A7E74",
      border: "#E7D8CC",
      borderStrong: "#D8C2B2",
      overlay: "rgba(23,32,51,0.32)",
      white: "#FFFFFF",
      danger: "#C2413B",
      warningSoft: "#FFF1D6",
    },
    shadows: {
      card: {
        shadowColor: "#7C5338",
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
      },
    },
  },
  midnight: {
    colors: {
      background: "#111827",
      backgroundSoft: "#1F2937",
      surface: "#182232",
      surfaceAlt: "#223149",
      surfaceMuted: "#24334C",
      primary: "#7DD3FC",
      primarySoft: "#163047",
      secondary: "#FB7185",
      secondarySoft: "#402130",
      accent: "#34D399",
      accentSoft: "#17382F",
      text: "#F8FAFC",
      textMuted: "#CBD5E1",
      textSoft: "#94A3B8",
      border: "#31415D",
      borderStrong: "#47617D",
      overlay: "rgba(2,6,23,0.58)",
      white: "#FFFFFF",
      danger: "#F87171",
      warningSoft: "#4A3413",
    },
    shadows: {
      card: {
        shadowColor: "#020617",
        shadowOpacity: 0.28,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
      },
    },
  },
  sunset: {
    colors: {
      background: "#FFF7F5",
      backgroundSoft: "#FCEDE8",
      surface: "#FFFFFF",
      surfaceAlt: "#FFF0EA",
      surfaceMuted: "#F7E1D8",
      primary: "#7C3AED",
      primarySoft: "#EFE7FF",
      secondary: "#F97316",
      secondarySoft: "#FFE7D4",
      accent: "#0F9D7A",
      accentSoft: "#DEF7F0",
      text: "#241B2F",
      textMuted: "#6E617A",
      textSoft: "#978A9F",
      border: "#ECD6C8",
      borderStrong: "#DEBCA6",
      overlay: "rgba(36,27,47,0.34)",
      white: "#FFFFFF",
      danger: "#DC2626",
      warningSoft: "#FFF0CC",
    },
    shadows: {
      card: {
        shadowColor: "#9A5E46",
        shadowOpacity: 0.09,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
      },
    },
  },
} as const;

type ThemeState = {
  currentThemeName: ThemeName;
  isInitialized: boolean;
};

const listeners = new Set<() => void>();

let themeState: ThemeState = {
  currentThemeName: "friends",
  isInitialized: false,
};

export let friendsZoneTheme = themes.friends;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setThemeState(nextThemeName: ThemeName, isInitialized = true) {
  themeState = {
    currentThemeName: nextThemeName,
    isInitialized,
  };
  friendsZoneTheme = themes[nextThemeName];
  emitChange();
}

export async function initializeTheme() {
  try {
    const stored = (await SecureStore.getItemAsync(STORAGE_KEY)) as ThemeName | null;
    const nextTheme = stored && stored in themes ? stored : "friends";
    setThemeState(nextTheme, true);
  } catch {
    setThemeState("friends", true);
  }
}

export function useThemeSettings() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => themeState,
    () => themeState
  );
}

export async function setThemePreference(themeName: ThemeName) {
  await SecureStore.setItemAsync(STORAGE_KEY, themeName);
  setThemeState(themeName, true);
  DevSettings.reload();
}

export const availableThemes: {
  id: ThemeName;
  name: string;
  description: string;
}[] = [
  {
    id: "friends",
    name: "Friends",
    description: "Quente, acolhedor e urbano. A cara principal do FriendsZone.",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Mais noturno, intenso e contrastado para quem prefere dark mode.",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Mais vibrante, criativo e social, com energia de fim de tarde.",
  },
];
