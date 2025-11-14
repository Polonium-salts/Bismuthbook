"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // 初始化：从 localStorage 加载主题设置
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as Theme | null
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
      setThemeState(savedTheme)
    }
  }, [])

  // 解析和应用主题
  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const getResolvedTheme = (): "light" | "dark" => {
      if (theme === "system") {
        return mediaQuery.matches ? "dark" : "light"
      }
      return theme
    }

    const updateTheme = () => {
      const newResolvedTheme = getResolvedTheme()
      console.log('[ThemeProvider] Updating theme:', { theme, resolvedTheme: newResolvedTheme })
      setResolvedTheme(newResolvedTheme)
      
      // 应用到 DOM
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newResolvedTheme)
      
      // 更新 meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          newResolvedTheme === "dark" ? "#0a0a0a" : "#ffffff"
        )
      }
    }

    // 立即更新
    updateTheme()

    // 监听系统主题变化（仅在 theme 为 system 时生效）
    const handler = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const newResolvedTheme = e.matches ? "dark" : "light"
        console.log('[ThemeProvider] System theme changed to:', newResolvedTheme)
        setResolvedTheme(newResolvedTheme)
        
        const root = document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(newResolvedTheme)
        
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
          metaThemeColor.setAttribute(
            "content",
            newResolvedTheme === "dark" ? "#0a0a0a" : "#ffffff"
          )
        }
      }
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    console.log('[ThemeProvider] Setting theme to:', newTheme)
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  // 始终提供 Context，即使未 mounted
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
