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
      className={`p-4 hover:shadow-md transition-all cursor-pointer ${
        !notification.read ? 'border-primary/50 bg-accent/20' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {notification.actor_avatar ? (
            <Avatar className="h-12 w-12">
              <AvatarImage src={notification.actor_avatar} />
              <AvatarFallback>{notification.actor_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              {notificationIcons[notification.type]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead(notification.id)
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(notification.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
            {!notification.read && (
              <Badge variant="default" className="text-xs">
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
              className="h-16 w-16 rounded object-cover"
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
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">通知</h1>
              {unreadCount > 0 && (
                <p className="text-muted-foreground mt-1">
                  {unreadCount} 条未读通知
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filter === 'all' ? '仅未读' : '全部'}
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  全部已读
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="like">点赞</TabsTrigger>
            <TabsTrigger value="comment">评论</TabsTrigger>
            <TabsTrigger value="follow">关注</TabsTrigger>
            <TabsTrigger value="system">系统</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center p-12">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
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
            <TabsContent key={type} value={type} className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                (() => {
                  const typeNotifications = filteredNotifications.filter(n => n.type === type)
                  return typeNotifications.length === 0 ? (
                    <div className="text-center p-12">
                      <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">暂无此类通知</p>
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
