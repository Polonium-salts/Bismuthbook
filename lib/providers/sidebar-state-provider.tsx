"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type SidebarStateContextType = {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  toggle: () => void
}

const SidebarStateContext = createContext<SidebarStateContextType | null>(null)

export function SidebarStateProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  // 首次挂载从本地读取
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebarCollapsed")
      if (saved !== null) setCollapsed(JSON.parse(saved))
    } catch {}
  }, [])

  // 同步保存到本地
  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed))
    } catch {}
  }, [collapsed])

  const toggle = () => setCollapsed((v) => !v)

  return (
    <SidebarStateContext.Provider value={{ collapsed, setCollapsed, toggle }}>
      {children}
    </SidebarStateContext.Provider>
  )
}

export function useSidebarState() {
  const ctx = useContext(SidebarStateContext)
  if (!ctx) throw new Error("useSidebarState must be used within SidebarStateProvider")
  return ctx
}

