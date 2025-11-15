"use client"

import { Header } from "./header"
import { Sidebar } from "./Sidebar"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { cn } from "@/lib/utils"
import PageTransition from './PageTransition'
import { useSidebarState } from "@/lib/providers/sidebar-state-provider"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  // 使用全局上下文，避免路由切换时重置引起的闪动
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } = useSidebarState()

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuClick={toggleSidebar}
      />
      
      <div className="flex pt-12 xs:pt-13 sm:pt-14 md:pt-16">
        {/* Desktop Sidebar - 仅在桌面端显示 */}
        <aside className={cn(
          "hidden md:block bg-gray-50 dark:bg-sidebar fixed left-0 transition-all duration-300",
          "top-12 xs:top-13 sm:top-14 md:top-16",
          "h-[calc(100vh-3rem)] xs:h-[calc(100vh-3.25rem)] sm:h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]",
          sidebarCollapsed ? "w-20" : "w-64"
        )}>
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            className="h-full"
          />
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 w-full",
          // 移动端：左右内边距
          "px-2 xs:px-3 sm:px-4",
          // 桌面端：左侧边距（为侧边栏留空间）+ 右侧内边距
          sidebarCollapsed ? "md:ml-20" : "md:ml-64",
          "md:px-6 lg:px-8",
          // 垂直内边距
          "py-3 xs:py-4 sm:py-5 md:py-6",
          // 底部内边距（移动端为底部导航栏留空间，桌面端正常）
          "pb-16 xs:pb-17 sm:pb-18 md:pb-6"
        )}>
          <PageTransition>
            <div className={cn(
              "mx-auto w-full",
              "max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl"
            )}>
              {children}
            </div>
          </PageTransition>
        </main>
      </div>

      {/* Mobile Bottom Navigation - 仅在移动端显示 */}
      <MobileBottomNav />
    </div>
  )
}
