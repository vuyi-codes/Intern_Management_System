export type Theme = "light" | "dark"

export const THEME_STORAGE_KEY = "inkdot.theme"
export const THEME_CHANGE_EVENT = "inkdot-theme-change"

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored === "light" || stored === "dark" ? stored : "dark"
  } catch {
    return "dark"
  }
}

export function getDocumentTheme(): Theme {
  if (typeof document === "undefined") return "dark"
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore quota / private mode failures.
  }
  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } })
  )
}

export function toggleTheme(current?: Theme): Theme {
  const from = current ?? getDocumentTheme()
  const next: Theme = from === "dark" ? "light" : "dark"
  applyTheme(next)
  return next
}

/** Inline boot script — keep in sync with THEME_STORAGE_KEY. */
export const themeBootScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light")document.documentElement.classList.remove("dark");else document.documentElement.classList.add("dark");}catch(e){document.documentElement.classList.add("dark");}})();`
