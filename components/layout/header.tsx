"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Menu, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserMenu } from "@/components/auth/user-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { useAuth } from "@/lib/providers/auth-provider"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }, [searchQuery, router])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as unknown as React.FormEvent)
    }
  }, [handleSearch])

  return (
    <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <nav className={cn(
        "container flex items-center justify-between",
        "h-12 xs:h-13 sm:h-14 md:h-16", // 响应式高度
        "px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8" // 响应式内边距
      )}>
        {/* 左侧区域：菜单按钮（仅桌面端） + Logo */}
        <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 md:space-x-4 flex-shrink-0">
          {/* 菜单按钮 - 仅在桌面端显示 */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-300",
              "hidden md:flex", // 移动端完全隐藏
              "h-9 w-9 md:h-10 md:w-10"
            )}
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          {/* Logo */}
          <Link className="flex items-center group" href="/">
            <div className="flex items-center space-x-1 xs:space-x-1.5 md:space-x-2">
              <div className="relative flex-shrink-0">
                <Sparkles className={cn(
                  "text-primary group-hover:text-primary/80 transition-all duration-300 group-hover:rotate-12",
                  "h-4 w-4 xs:h-5 xs:w-5 md:h-6 md:w-6"
                )} />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </div>
              <span className={cn(
                "font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent",
                "group-hover:from-primary/90 group-hover:via-primary/80 group-hover:to-primary/70 transition-all duration-300",
                "text-sm xs:text-base md:text-xl",
                "hidden xs:block truncate"
              )}>
                BismuthBook
              </span>
            </div>
          </Link>
        </div>

        {/* 中间区域：搜索栏 - YouTube 风格 */}
        <form 
          onSubmit={handleSearch} 
          className={cn(
            "flex-1 mx-1 xs:mx-2 sm:mx-4 md:mx-8",
            "max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl"
          )}
        >
          <div className="relative group">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300 pointer-events-none",
              "left-2 xs:left-3 md:left-4",
              "h-3 w-3 xs:h-3.5 xs:w-3.5 md:h-4 md:w-4"
            )} />
            <Input
              type="text"
              placeholder="搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full bg-muted/50 border-border focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                "transition-all duration-300 placeholder:text-muted-foreground/70 hover:bg-muted/70 cursor-text",
                "pl-7 xs:pl-9 md:pl-12",
                "pr-2 xs:pr-3 md:pr-4",
                "py-1.5 xs:py-2 md:py-3",
                "text-[11px] xs:text-xs md:text-sm",
                "rounded-lg xs:rounded-xl md:rounded-2xl"
              )}
            />
            <div className="absolute inset-0 rounded-lg xs:rounded-xl md:rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </form>

        {/* 右侧区域：主题切换 + 通知 + 用户菜单 */}
        <div className="flex items-center space-x-0.5 xs:space-x-1 md:space-x-2 flex-shrink-0">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {user && (
            <div className="hidden sm:block">
              <NotificationDropdown />
            </div>
          )}
          
          <UserMenu />
        </div>
      </nav>
    </header>
  )
}