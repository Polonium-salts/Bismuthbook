export type NotificationType = 
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'reply'
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
  actor_id?: string
  actor_name?: string
  actor_avatar?: string
  image_id?: string
  image_url?: string
}

export interface NotificationWithActor extends Notification {
  actor?: {
    id: string
    username: string
    avatar_url: string
  }
}
