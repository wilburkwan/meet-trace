/** Colour themes; ids must match the [data-ms-theme] blocks in ui-kit/tokens.css. */
export const THEME_IDS = ["aurora", "ocean", "forest", "sunset"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = "aurora";

/** chrome.storage.local key holding the selected theme. */
export const THEME_STORAGE_KEY = "uiTheme";

/** Attribute that switches the token set (on <html> or the overlay root). */
export const THEME_ATTRIBUTE = "data-ms-theme";

/** Preview colours (background, accent) for the theme picker. */
export const THEME_SWATCHES: Record<ThemeId, readonly [string, string]> = {
  aurora: ["#242030", "#7c5cff"],
  ocean: ["#132a40", "#0e93c4"],
  forest: ["#1c2c21", "#3f9f4f"],
  sunset: ["#30211e", "#d9662f"],
};

/** Narrows a stored value into a known theme, falling back to the default. */
export const toThemeId = (value: unknown): ThemeId =>
  THEME_IDS.find((id) => id === value) ?? DEFAULT_THEME;

/**
 * Loads the stored theme and calls `onChange` now and whenever it changes
 * (from any extension page). Returns an unsubscribe function.
 */
export const watchTheme = (onChange: (theme: ThemeId) => void): (() => void) => {
  chrome.storage.local
    .get(THEME_STORAGE_KEY)
    .then((result) => onChange(toThemeId(result[THEME_STORAGE_KEY])))
    .catch(() => {});

  const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area === "local" && THEME_STORAGE_KEY in changes) {
      onChange(toThemeId(changes[THEME_STORAGE_KEY].newValue));
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
};

/** Persists the selected theme; every open page and overlay updates live. */
export const saveTheme = (theme: ThemeId): Promise<void> =>
  chrome.storage.local.set({ [THEME_STORAGE_KEY]: theme });
