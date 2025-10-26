'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, TrendingUp, Heart, Bookmark, User, Users, Settings, Plus, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

const navigationItems = [
  { icon: Home, label: "首页", href: "/" },
  { icon: Grid3X3, label: "画廊", href: "/gallery" },
  { icon: TrendingUp, label: "热门", href: "/trending" },
  { icon: Heart, label: "关注", href: "/following" },
  { icon: Bookmark, label: "收藏", href: "/bookmarks" },
]

const userSections = [
  { icon: User, label: "我的作品", href: "/my-works" },
  { icon: Users, label: "关注的艺术家", href: "/following-artists" },
]

export function Sidebar({ className, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()

  const renderMenuItem = (item: any, isActive: boolean) => {
    const buttonContent = (
      <Button
        key={item.href}
        variant="ghost"
        asChild
        className={cn(
          "w-full transition-all duration-200 group relative",
          isCollapsed 
            ? "justify-center p-0 h-12 w-12 mx-auto rounded-xl hover:bg-sidebar-accent" 
            : "justify-start h-10 px-3 rounded-lg hover:bg-sidebar-accent",
          isActive && isCollapsed && "bg-sidebar-primary hover:bg-sidebar-primary text-sidebar-primary-foreground",
          isActive && !isCollapsed && "bg-sidebar-accent text-sidebar-accent-foreground",
          !isActive && "text-sidebar-foreground/70 hover:text-sidebar-foreground"
        )}
      >
        <Link href={item.href}>
          <item.icon className={cn(
            "transition-all duration-200", 
            isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3",
            isActive && isCollapsed && "text-sidebar-primary-foreground",
            isActive && !isCollapsed && "text-sidebar-primary"
          )} />
          {!isCollapsed && (
            <span className="font-medium text-sm transition-all duration-200">{item.label}</span>
          )}
          
          {/* 选中指示器 - 仅在展开状态显示 */}
          {isActive && !isCollapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
          )}
        </Link>
      </Button>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider key={item.href}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2 bg-popover text-popover-foreground border-border">
              <p className="font-medium text-sm">{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return buttonContent
  }

  return (
    <aside className={cn(
      "pb-4 transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col h-full", 
      isCollapsed ? "w-20" : "w-64", 
      className
    )}>
      {/* 顶部区域 */}
      <header className={cn("pt-4 transition-all duration-300", isCollapsed ? "px-4" : "px-4")}>
        {/* Logo/标题区域 */}
        
        {/* 添加按钮 */}
        <Button
          variant="ghost"
          asChild
          className={cn(
            "transition-all duration-200 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground mb-6",
            isCollapsed 
              ? "w-12 h-12 p-0 rounded-xl mx-auto" 
              : "w-full h-10 rounded-lg"
          )}
        >
          <Link href="/upload">
            <Plus className={cn("transition-all duration-200", isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-2")} />
            {!isCollapsed && <span className="font-medium text-sm">新建作品</span>}
          </Link>
        </Button>
      </header>

      {/* 主要导航区域 */}
      <main className={cn("flex-1 transition-all duration-300", isCollapsed ? "px-4" : "px-4")}>
        <ScrollArea className="h-full">
          <nav className={cn("space-y-6", isCollapsed && "space-y-4")}>
            {/* 主导航 */}
            <section>
              {!isCollapsed && (
                <h2 className="mb-3 px-2 text-xs font-semibold tracking-wider text-sidebar-foreground/60 uppercase">
                  导航
                </h2>
              )}
              <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  return renderMenuItem(item, isActive)
                })}
              </div>
            </section>

            {/* 分隔线 */}
            {!isCollapsed && (
              <div className="px-2">
                <Separator className="bg-sidebar-border" />
              </div>
            )}

            {/* 用户相关 */}
            <section>
              {!isCollapsed && (
                <h2 className="mb-3 px-2 text-xs font-semibold tracking-wider text-sidebar-foreground/60 uppercase">
                  个人
                </h2>
              )}
              <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
                {userSections.map((section) => {
                  const isActive = pathname === section.href
                  return renderMenuItem(section, isActive)
                })}
              </div>
            </section>
          </nav>
        </ScrollArea>
      </main>

      {/* 底部设置 */}
      <footer className={cn("pt-4 border-t border-sidebar-border transition-all duration-300", isCollapsed ? "px-4" : "px-4")}>
        <Button
          variant="ghost"
          className={cn(
            "transition-all duration-200 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed 
              ? "w-12 h-12 p-0 rounded-xl mx-auto" 
              : "w-full h-10 justify-start rounded-lg px-3"
          )}
        >
          <Settings className={cn("transition-all duration-200", isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3")} />
          {!isCollapsed && <span className="font-medium text-sm">设置</span>}
        </Button>
      </footer>
    </aside>
  )
}