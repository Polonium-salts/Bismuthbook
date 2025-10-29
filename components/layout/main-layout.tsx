"use client"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./Sidebar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import PageTransition from './PageTransition'
import { useSidebarState } from "@/lib/providers/sidebar-state-provider"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  // 使用全局上下文，避免路由切换时重置引起的闪动
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } = useSidebarState()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuClick={toggleSidebar} 
        onMobileMenuClick={() => setMobileMenuOpen(true)}
      />
      
      <div className="flex pt-14">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden md:block bg-gray-50 fixed left-0 top-14 h-[calc(100vh-3.5rem)] transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-64"
        )}>
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            className="h-full"
          />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar isCollapsed={false} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 p-6",
          sidebarCollapsed ? "md:pl-26" : "md:pl-70"
        )}>
          <PageTransition>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
