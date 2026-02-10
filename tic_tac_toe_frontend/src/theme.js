/**
 * Theme utilities for the Tic Tac Toe app.
 * Uses a root attribute on <html> and CSS variables for theming.
 */

const STORAGE_KEY = 'ttt-theme';

/**
 * @typedef {'light'|'dark'} Theme
 */

/**
 * PUBLIC_INTERFACE
 * Determine system-preferred theme (via prefers-color-scheme).
 *
 * @returns {Theme} 'dark' when user agent prefers dark; otherwise 'light'.
 */
export function getSystemTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * PUBLIC_INTERFACE
 * Get a stored theme (if present and valid).
 *
 * @returns {Theme|null} The stored theme or null when none/invalid.
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'light' || raw === 'dark' ? raw : null;
  } catch {
    // localStorage may be blocked; treat as "no stored theme"
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * Apply a theme to the document root and update browser UI color-scheme.
 *
 * This function is safe to call repeatedly.
 *
 * @param {Theme} theme
 * @returns {void}
 */
export function applyTheme(theme) {
  if (typeof document === 'undefined') return;

  const normalized = theme === 'dark' ? 'dark' : 'light';

  // Drive all styling via a single root attribute.
  document.documentElement.setAttribute('data-theme', normalized);

  // Helps built-in controls (scrollbars/form widgets) match the theme.
  document.documentElement.style.colorScheme = normalized;
}

/**
 * PUBLIC_INTERFACE
 * Persist a theme selection to localStorage.
 *
 * @param {Theme} theme
 * @returns {void}
 */
export function storeTheme(theme) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore persistence errors (privacy mode, blocked storage, etc.)
  }
}

/**
 * PUBLIC_INTERFACE
 * Resolve the initial theme: stored preference wins, otherwise system preference.
 *
 * @returns {Theme}
 */
export function resolveInitialTheme() {
  return getStoredTheme() || getSystemTheme();
}

/**
 * PUBLIC_INTERFACE
 * Clear any stored theme preference (reverts future resolves to system preference).
 *
 * @returns {void}
 */
export function clearStoredTheme() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
