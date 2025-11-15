"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

/**
 * 移动端通知按钮 - 点击直接跳转到通知页面
 * 提供更好的移动端体验
 */
export function MobileNotificationButton() {
  const router = useRouter()
  const { unreadCount } = useNotifications()

  const handleClick = () => {
    router.push('/notifications')
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleClick}
      className={cn(
        "relative hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-300 group",
        "h-8 w-8 sm:h-9 sm:w-9"
      )}
    >
      <Bell className="h-4 w-4 sm:h-5 sm:w-5 group-active:animate-pulse" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className={cn(
            "absolute -top-0.5 -right-0.5 rounded-full p-0",
            "h-4 w-4 text-[10px]",
            "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg",
            "border-2 border-background flex items-center justify-center"
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
      <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-active:opacity-100 transition-opacity duration-300" />
    </Button>
  )
}
