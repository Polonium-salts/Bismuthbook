import { useState, useEffect, useCallback, useRef } from 'react'
import { notificationService } from '@/lib/services/notification-service'
import { Notification } from '@/lib/types/notification'
import { useAuth } from '@/lib/providers/auth-provider'
import { supabase } from '@/lib/supabase'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const subscriptionRef = useRef<any>(null)

  const loadNotifications = useCallback(async (silent = false) => {
    if (!user) return

    try {
      if (!silent) setIsLoading(true)
      setError(null)
      const data = await notificationService.getNotifications(user.id)
      setNotifications(data)
    } catch (err) {
      console.error('Error loading notifications:', err)
      // 不设置错误状态，避免显示错误提示
      // setError('加载通知失败')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [user])

  const loadUnreadCount = useCallback(async () => {
    if (!user) return

    try {
      const count = await notificationService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (err) {
      console.error('Error loading unread count:', err)
    }
  }, [user])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      await notificationService.markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [user])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      // 如果删除的是未读通知，更新未读数量
      const notification = notifications.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }, [notifications])

  useEffect(() => {
    if (user) {
      // 初始加载
      loadNotifications()
      loadUnreadCount()

      // 设置轮询 - 每10秒静默刷新一次
      const pollInterval = setInterval(() => {
        loadNotifications(true) // 静默刷新，不显示加载状态
        loadUnreadCount()
      }, 10000) // 10秒

      // 设置 Supabase 实时订阅
      const setupRealtimeSubscription = async () => {
        try {
          // 订阅当前用户的通知变化
          const channel = (supabase as any)
            .channel('notifications-changes')
            .on(
              'postgres_changes',
              {
                event: '*', // 监听所有事件（INSERT, UPDATE, DELETE）
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
              },
              (payload: any) => {
                console.log('📬 Notification change detected:', payload)
                
                // 实时更新通知列表和未读数量
                loadNotifications(true)
                loadUnreadCount()
              }
            )
            .subscribe()

          subscriptionRef.current = channel
        } catch (error) {
          // 如果实时订阅失败（表不存在等），静默处理
          console.log('Realtime subscription not available')
        }
      }

      setupRealtimeSubscription()

      // 清理函数
      return () => {
        clearInterval(pollInterval)
        
        // 取消订阅
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current)
          subscriptionRef.current = null
        }
      }
    }
  }, [user, loadNotifications, loadUnreadCount])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
}
