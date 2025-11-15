"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Calendar, 
  Link as LinkIcon, 
  Settings,
  Cog,
  UserPlus,
  UserMinus,
  Share2,
  Loader2
} from "lucide-react"
import { UserProfile } from "@/lib/types/database"

interface UserStats {
  artworks: number
  followers: number
  following: number
  likes: number
}

interface UserProfileHeaderProps {
  userProfile: UserProfile
  userStats: UserStats
  isOwnProfile: boolean
  isFollowing: boolean
  followLoading: boolean
  onFollowToggle: () => void
}

export function UserProfileHeader({
  userProfile,
  userStats,
  isOwnProfile,
  isFollowing,
  followLoading,
  onFollowToggle
}: UserProfileHeaderProps) {
  const [shareLoading, setShareLoading] = useState(false)

  const handleShare = async () => {
    setShareLoading(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${userProfile.full_name || userProfile.username} 的个人主页`,
          text: `查看 ${userProfile.full_name || userProfile.username} 在 Bismuthbook 上的精彩作品`,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        // 这里可以添加 toast 提示
      }
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setShareLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 用户基本信息 - 移动端优化 */}
      <div className="flex flex-col gap-4">
        {/* 头像和基本信息 - 移动端横向布局 */}
        <div className="flex items-start gap-4">
          {/* 头像 */}
          <div className="flex-shrink-0">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 sm:border-4 border-background shadow-lg">
              <AvatarImage 
                src={userProfile.avatar_url || ""} 
                alt={userProfile.username}
                className="object-cover"
              />
              <AvatarFallback className="text-lg sm:text-xl">
                <User className="w-10 h-10 sm:w-12 sm:h-12" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* 用户名和统计 - 移动端紧凑布局 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
              {userProfile.full_name || userProfile.username}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3">@{userProfile.username}</p>
            
            {/* 移动端统计数据 - 紧凑显示 */}
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">{userStats.artworks}</span>
                <span className="text-muted-foreground ml-1">作品</span>
              </div>
              <div>
                <span className="font-semibold">{userStats.followers}</span>
                <span className="text-muted-foreground ml-1">粉丝</span>
              </div>
              <div>
                <span className="font-semibold">{userStats.following}</span>
                <span className="text-muted-foreground ml-1">关注</span>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 - 移动端全宽 */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <>
              <Link href="/settings" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Cog className="w-4 h-4 mr-2" />
                  编辑资料
                </Button>
              </Link>
              <Link href="/my-works" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  管理作品
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={onFollowToggle}
                disabled={followLoading}
                className="flex-1"
              >
                {followLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isFollowing ? (
                  <UserMinus className="w-4 h-4 mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isFollowing ? '已关注' : '关注'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                disabled={shareLoading}
                className="px-3"
              >
                {shareLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </Button>
            </>
          )}
        </div>

        {/* 个人简介 */}
        {userProfile.bio && (
          <p className="text-sm leading-relaxed">
            {userProfile.bio}
          </p>
        )}

        {/* 附加信息 */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
          {userProfile.website && (
            <a 
              href={userProfile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px]">
                {userProfile.website.replace(/^https?:\/\//, '')}
              </span>
            </a>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {userProfile.created_at ? 
                new Date(userProfile.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long'
                }) : '未知'
              }
            </span>
          </div>
        </div>
      </div>

      {/* 详细统计卡片 - 桌面端显示 */}
      <div className="hidden sm:grid grid-cols-4 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {userStats.artworks}
            </div>
            <div className="text-sm text-muted-foreground">作品</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {userStats.followers}
            </div>
            <div className="text-sm text-muted-foreground">粉丝</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {userStats.following}
            </div>
            <div className="text-sm text-muted-foreground">关注</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {userStats.likes}
            </div>
            <div className="text-sm text-muted-foreground">获赞</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}