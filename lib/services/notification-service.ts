import { supabase } from '../supabase'
import { Notification, NotificationType } from '../types/notification'

class NotificationService {
  // 获取用户的通知列表
  async getNotifications(userId: string, limit = 20, offset = 0) {
    try {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        // 如果表不存在，静默返回空数组
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
          // 只在开发环境显示警告
          if (process.env.NODE_ENV === 'development') {
            console.warn('💡 Notifications table not found. Run the migration in supabase/migrations/create_notifications_table.sql')
          }
          return []
        }
        // 其他错误也静默处理
        return []
      }
      return data as Notification[]
    } catch (error) {
      // 完全静默，只返回空数组
      return []
    }
  }

  // 获取未读通知数量
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await (supabase as any)
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        // 静默返回 0
        return 0
      }
      return count || 0
    } catch (error) {
      // 静默返回 0
      return 0
    }
  }

  // 标记通知为已读
  async markAsRead(notificationId: string) {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // 标记所有通知为已读
  async markAllAsRead(userId: string) {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // 删除通知
  async deleteNotification(notificationId: string) {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  // 创建通知
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      link?: string
      actorId?: string
      actorName?: string
      actorAvatar?: string
      imageId?: string
      imageUrl?: string
    }
  ) {
    try {
      console.log('🔔 Creating notification:', {
        userId,
        type,
        title,
        actorName: options?.actorName
      })

      const { data, error } = await (supabase as any)
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          link: options?.link,
          actor_id: options?.actorId,
          actor_name: options?.actorName,
          actor_avatar: options?.actorAvatar,
          image_id: options?.imageId,
          image_url: options?.imageUrl,
          read: false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Notification creation error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // 如果表不存在，静默失败
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('💡 Notification not created - table does not exist yet')
          }
          return null
        }
        throw error
      }
      return data as Notification
    } catch (error) {
      // 静默处理，不抛出错误
      if (process.env.NODE_ENV === 'development') {
        console.warn('💡 Notification creation skipped')
      }
      return null
    }
  }

  // 批量创建通知（用于关注者通知等）
  async createBulkNotifications(notifications: Array<{
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
    actorId?: string
    actorName?: string
    actorAvatar?: string
    imageId?: string
    imageUrl?: string
  }>) {
    try {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .insert(
          notifications.map(n => ({
            user_id: n.userId,
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link,
            actor_id: n.actorId,
            actor_name: n.actorName,
            actor_avatar: n.actorAvatar,
            image_id: n.imageId,
            image_url: n.imageUrl,
            read: false
          }))
        )
        .select()

      if (error) {
        // 如果表不存在，静默失败
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('💡 Bulk notifications not created - table does not exist yet')
          }
          return []
        }
        throw error
      }
      return data as Notification[]
    } catch (error) {
      // 静默处理，不抛出错误
      if (process.env.NODE_ENV === 'development') {
        console.warn('💡 Bulk notification creation skipped')
      }
      return []
    }
  }
}

export const notificationService = new NotificationService()
