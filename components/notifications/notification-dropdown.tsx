"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Heart, MessageCircle, UserPlus, Check, Trash2, Settings } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { Notification, NotificationType } from "@/lib/types/notification"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  like: <Heart className="h-4 w-4 text-red-500" />,
  comment: <MessageCircle className="h-4 w-4 text-blue-500" />,
  follow: <UserPlus className="h-4 w-4 text-green-500" />,
  mention: <MessageCircle className="h-4 w-4 text-purple-500" />,
  reply: <MessageCircle className="h-4 w-4 text-orange-500" />,
  system: <Bell className="h-4 w-4 text-gray-500" />
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: zhCN
  })

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      className={`flex gap-3 p-3 hover:bg-accent/50 transition-colors ${
        !notification.read ? 'bg-accent/20' : ''
      }`}
    >
      <div className="flex-shrink-0 mt-1">
        {notification.actor_avatar ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.actor_avatar} />
            <AvatarFallback>{notification.actor_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            {notificationIcons[notification.type]}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {notification.link ? (
          <Link href={notification.link} onClick={handleClick}>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-tight">{notification.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </Link>
        ) : (
          <div className="space-y-1" onClick={handleClick}>
            <p className="text-sm font-medium leading-tight">{notification.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex items-start gap-1">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsRead(notification.id)
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {notification.image_url && (
        <div className="flex-shrink-0">
          <img
            src={notification.image_url}
            alt=""
            className="h-12 w-12 rounded object-cover"
          />
        </div>
      )}
    </div>
  )
}

export function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-accent hover:text-accent-foreground rounded-xl transition-all duration-300 group"
        >
          <Bell className="h-5 w-5 group-hover:animate-pulse" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-2 border-background flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">通知</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                全部已读
              </Button>
            )}
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">暂无通知</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/notifications">
                <Button variant="ghost" className="w-full text-sm">
                  查看全部通知
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
