"use client"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./Sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
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
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}