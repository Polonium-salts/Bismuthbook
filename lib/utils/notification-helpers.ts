import { notificationService } from '../services/notification-service'
import { NotificationType } from '../types/notification'

/**
 * 创建点赞通知
 */
export async function createLikeNotification(
  artworkOwnerId: string,
  likerId: string,
  likerName: string,
  likerAvatar: string,
  artworkId: string,
  artworkUrl: string
) {
  // 不给自己发通知
  if (artworkOwnerId === likerId) return

  await notificationService.createNotification(
    artworkOwnerId,
    'like',
    '新的点赞',
    `${likerName} 点赞了您的作品`,
    {
      link: `/artwork/${artworkId}`,
      actorId: likerId,
      actorName: likerName,
      actorAvatar: likerAvatar,
      imageId: artworkId,
      imageUrl: artworkUrl
    }
  )
}

/**
 * 创建评论通知
 */
export async function createCommentNotification(
  artworkOwnerId: string,
  commenterId: string,
  commenterName: string,
  commenterAvatar: string,
  artworkId: string,
  artworkUrl: string,
  commentText: string,
  commentId?: string
) {
  // 不给自己发通知
  if (artworkOwnerId === commenterId) return

  const link = commentId 
    ? `/artwork/${artworkId}#comment-${commentId}`
    : `/artwork/${artworkId}`

  await notificationService.createNotification(
    artworkOwnerId,
    'comment',
    '新的评论',
    `${commenterName} 评论了您的作品：${commentText.slice(0, 50)}${commentText.length > 50 ? '...' : ''}`,
    {
      link,
      actorId: commenterId,
      actorName: commenterName,
      actorAvatar: commenterAvatar,
      imageId: artworkId,
      imageUrl: artworkUrl
    }
  )
}

/**
 * 创建关注通知
 */
export async function createFollowNotification(
  followedUserId: string,
  followerId: string,
  followerName: string,
  followerAvatar: string,
  followerUsername: string
) {
  // 不给自己发通知
  if (followedUserId === followerId) return

  await notificationService.createNotification(
    followedUserId,
    'follow',
    '新的关注者',
    `${followerName} 关注了您`,
    {
      link: `/user/${followerUsername}`,
      actorId: followerId,
      actorName: followerName,
      actorAvatar: followerAvatar
    }
  )
}

/**
 * 创建回复通知
 */
export async function createReplyNotification(
  originalCommenterId: string,
  replierId: string,
  replierName: string,
  replierAvatar: string,
  artworkId: string,
  artworkUrl: string,
  replyText: string,
  commentId: string
) {
  // 不给自己发通知
  if (originalCommenterId === replierId) return

  await notificationService.createNotification(
    originalCommenterId,
    'reply',
    '新的回复',
    `${replierName} 回复了您的评论：${replyText.slice(0, 50)}${replyText.length > 50 ? '...' : ''}`,
    {
      link: `/artwork/${artworkId}#comment-${commentId}`,
      actorId: replierId,
      actorName: replierName,
      actorAvatar: replierAvatar,
      imageId: artworkId,
      imageUrl: artworkUrl
    }
  )
}

/**
 * 创建系统通知
 */
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  await notificationService.createNotification(
    userId,
    'system',
    title,
    message,
    { link }
  )
}

/**
 * 批量创建系统通知（给所有用户）
 */
export async function createSystemNotificationForAll(
  userIds: string[],
  title: string,
  message: string,
  link?: string
) {
  const notifications = userIds.map(userId => ({
    userId,
    type: 'system' as NotificationType,
    title,
    message,
    link
  }))

  await notificationService.createBulkNotifications(notifications)
}

/**
 * 通知所有关注者新作品发布
 */
export async function notifyFollowersNewArtwork(
  followerIds: string[],
  artistId: string,
  artistName: string,
  artistAvatar: string,
  artworkId: string,
  artworkUrl: string,
  artworkTitle: string
) {
  const notifications = followerIds
    .filter(id => id !== artistId) // 不给自己发通知
    .map(followerId => ({
      userId: followerId,
      type: 'system' as NotificationType,
      title: '新作品发布',
      message: `${artistName} 发布了新作品《${artworkTitle}》`,
      link: `/artwork/${artworkId}`,
      actorId: artistId,
      actorName: artistName,
      actorAvatar: artistAvatar,
      imageId: artworkId,
      imageUrl: artworkUrl
    }))

  if (notifications.length > 0) {
    await notificationService.createBulkNotifications(notifications)
  }
}
