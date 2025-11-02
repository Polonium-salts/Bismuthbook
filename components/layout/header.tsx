"use client"

import Link from "next/link"
import { Search, Bell, Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/lib/providers/auth-provider"

interface HeaderProps {
  onMenuClick: () => void
  onMobileMenuClick: () => void
}

export function Header({ onMenuClick, onMobileMenuClick }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <nav className="container flex h-16 items-center justify-between px-4 sm:px-6">
        {/* 左侧区域：菜单按钮 + Logo */}
        <div className="flex items-center space-x-4">
          {/* 菜单按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-300 md:hidden"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-300 hidden md:flex"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link className="flex items-center group" href="/">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-primary group-hover:text-primary/80 transition-all duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent group-hover:from-primary/90 group-hover:via-primary/80 group-hover:to-primary/70 transition-all duration-300 hidden sm:block">
                BismuthBook
              </span>
            </div>
          </Link>
        </div>

        {/* 中间区域：搜索栏 */}
        <div className="flex-1 max-w-2xl mx-4 sm:mx-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <Input
              placeholder="搜索作品、艺术家..."
              className="w-full pl-12 pr-4 py-3 bg-muted/50 border-border rounded-2xl focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm placeholder:text-muted-foreground/70 hover:bg-muted/70"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        {/* 右侧区域：通知 + 用户菜单 */}
        <div className="flex items-center space-x-2">
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-300 group"
            >
              <Bell className="h-5 w-5 group-hover:animate-pulse" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-2 border-background animate-pulse hover:animate-bounce"
              >
                3
              </Badge>
              <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          )}
          
          <UserMenu />
        </div>
      </nav>
    </header>
  )
}