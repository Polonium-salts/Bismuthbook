"use client"

import { useState } from "react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Check, 
  CheckCheck, 
  Trash2,
  Filter
} from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { Notification, NotificationType } from "@/lib/types/notification"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useAuth } from "@/lib/providers/auth-provider"

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  like: <Heart className="h-5 w-5 text-red-500" />,
  comment: <MessageCircle className="h-5 w-5 text-blue-500" />,
  follow: <UserPlus className="h-5 w-5 text-green-500" />,
  mention: <MessageCircle className="h-5 w-5 text-purple-500" />,
  reply: <MessageCircle className="h-5 w-5 text-orange-500" />,
  system: <Bell className="h-5 w-5 text-gray-500" />
}

function NotificationCard({ 
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

  const content = (
    <Card 
      className={`p-3 sm:p-4 active:shadow-md sm:hover:shadow-md transition-all cursor-pointer ${
        !notification.read ? 'border-primary/50 bg-accent/20' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          {notification.actor_avatar ? (
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage src={notification.actor_avatar} />
              <AvatarFallback>{notification.actor_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center">
              {notificationIcons[notification.type]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
            <h4 className="font-semibold text-xs sm:text-sm">{notification.title}</h4>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead(notification.id)
                  }}
                >
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(notification.id)
                }}
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs text-muted-foreground">{timeAgo}</p>
            {!notification.read && (
              <Badge variant="default" className="text-[10px] sm:text-xs h-5">
                新
              </Badge>
            )}
          </div>
        </div>

        {notification.image_url && (
          <div className="flex-shrink-0">
            <img
              src={notification.image_url}
              alt=""
              className="h-12 w-12 sm:h-16 sm:w-16 rounded object-cover"
            />
          </div>
        )}
      </div>
    </Card>
  )

  return notification.link ? (
    <Link href={notification.link}>{content}</Link>
  ) : (
    content
  )
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">通知中心</h2>
            <p className="text-muted-foreground mb-6">
              登录后查看您的通知
            </p>
            <Button onClick={() => window.location.href = '/?auth=login'}>
              登录
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-4 sm:py-6 md:py-8 max-w-4xl">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">通知</h1>
              {unreadCount > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {unreadCount} 条未读通知
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                className="h-8 px-2 sm:px-3"
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">{filter === 'all' ? '仅未读' : '全部'}</span>
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-2 sm:px-3"
                >
                  <CheckCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">全部已读</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-9 sm:h-10">
            <TabsTrigger value="all" className="text-xs sm:text-sm">全部</TabsTrigger>
            <TabsTrigger value="like" className="text-xs sm:text-sm">点赞</TabsTrigger>
            <TabsTrigger value="comment" className="text-xs sm:text-sm">评论</TabsTrigger>
            <TabsTrigger value="follow" className="text-xs sm:text-sm">关注</TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm">系统</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 sm:space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8 sm:p-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center p-8 sm:p-12">
                <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  {filter === 'unread' ? '没有未读通知' : '暂无通知'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </TabsContent>

          {(['like', 'comment', 'follow', 'system'] as const).map((type) => (
            <TabsContent key={type} value={type} className="space-y-3 sm:space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8 sm:p-12">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                (() => {
                  const typeNotifications = filteredNotifications.filter(n => n.type === type)
                  return typeNotifications.length === 0 ? (
                    <div className="text-center p-8 sm:p-12">
                      <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                      <p className="text-sm sm:text-base text-muted-foreground">暂无此类通知</p>
                    </div>
                  ) : (
                    typeNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))
                  )
                })()
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  )
}
