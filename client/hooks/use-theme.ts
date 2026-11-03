"use client"

import * as React from "react"

import {
  applyTheme,
  getDocumentTheme,
  getStoredTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  toggleTheme as flipTheme,
  type Theme,
} from "@/lib/theme"

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>("dark")
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const stored = getStoredTheme()
    applyTheme(stored)
    setTheme(stored)
    setReady(true)

    function onThemeChange(event: Event) {
      const detail = (event as CustomEvent<{ theme: Theme }>).detail
      if (detail?.theme === "light" || detail?.theme === "dark") {
        setTheme(detail.theme)
      }
    }

    function onStorage(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) return
      const next =
        event.newValue === "light" || event.newValue === "dark"
          ? event.newValue
          : getStoredTheme()
      applyTheme(next)
      setTheme(next)
    }

    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  function setThemeValue(next: Theme) {
    applyTheme(next)
    setTheme(next)
  }

  function toggleTheme() {
    const next = flipTheme(ready ? theme : getDocumentTheme())
    setTheme(next)
  }

  return { theme, setTheme: setThemeValue, toggleTheme }
}
