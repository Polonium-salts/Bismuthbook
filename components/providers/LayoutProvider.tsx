'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

interface LayoutContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  isMobile: boolean
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // 默认关闭，响应式控制
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // 在桌面端默认打开侧边栏，移动端默认关闭
      setSidebarOpen(prevOpen => {
        if (!mobile && !prevOpen) {
          return true
        } else if (mobile && prevOpen) {
          return false
        }
        return prevOpen
      })
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const value = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    isMobile,
  }

  return (
    <LayoutContext.Provider value={value}>
      <div className="min-h-screen bg-base-100">
        <Navbar />
        
        {/* 移动端遮罩层 */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className="flex">
          <Sidebar />
          <main 
            className={`flex-1 transition-all duration-300 pt-16 ${
              isMobile 
                ? 'ml-0' // 移动端不偏移
                : sidebarOpen 
                  ? 'ml-72' // 匹配侧边栏的 w-72 (18rem)
                  : 'ml-16' // 匹配侧边栏的 w-16 (4rem)
            }`}
          >
            <div className="p-3 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}