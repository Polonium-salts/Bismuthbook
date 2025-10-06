'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 hover:bg-base-200/70 rounded-xl transition-all duration-300 hover:scale-105 relative group ring-1 ring-transparent hover:ring-primary/20"
      aria-label={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors" />
      ) : (
        <SunIcon className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors" />
      )}
    </button>
  )
}