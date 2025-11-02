"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserMinus, UserPlus, Heart, Image as ImageIcon } from "lucide-react"
import { followService } from "@/lib/services/follow-service"
import { useAuth } from "@/lib/providers/auth-provider"

interface UserCardProps {
  user: {
    id: string
    username: string
    email?: string
    avatar_url?: string | null
    bio?: string | null
  }
  stats?: {
    followers: number
    following: number
    artworks: number
    totalLikes: number
  }
  isFollowing?: boolean
  onFollowChange?: (userId: string, isFollowing: boolean) => void
}

export function UserCard({ user, stats, isFollowing = false, onFollowChange }: UserCardProps) {
  const { user: currentUser } = useAuth()
  const [isFollowingState, setIsFollowingState] = useState(isFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const isOwnProfile = currentUser?.id === user.id

  const handleFollowToggle = async () => {
    if (!currentUser || isOwnProfile) return

    setIsLoading(true)
    try {
      if (isFollowingState) {
        await followService.unfollowUser(currentUser.id, user.id)
        setIsFollowingState(false)
        onFollowChange?.(user.id, false)
      } else {
        await followService.followUser(currentUser.id, user.id)
        setIsFollowingState(true)
        onFollowChange?.(user.id, true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Link href={`/user/${user.username}`}>
            <Avatar className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <Link href={`/user/${user.username}`} className="hover:underline">
                <h3 className="font-medium text-sm truncate">{user.username}</h3>
              </Link>
              
              {/* Follow Button */}
              {!isOwnProfile && currentUser && (
                <Button
                  variant={isFollowingState ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollowToggle}
                  disabled={isLoading}
                  className="ml-2 shrink-0"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isFollowingState ? (
                    <>
                      <UserMinus className="w-3 h-3 mr-1" />
                      取消关注
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-1" />
                      关注
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {user.bio}
              </p>
            )}

            {/* Stats */}
            {stats && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>{stats.artworks}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{stats.totalLikes}</span>
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {stats.followers} 粉丝
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}