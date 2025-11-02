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
    <div className="space-y-6">
      {/* 用户基本信息 */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* 头像 */}
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-lg">
            <AvatarImage 
              src={userProfile.avatar_url || ""} 
              alt={userProfile.username}
              className="object-cover"
            />
            <AvatarFallback className="text-xl sm:text-2xl">
              <User className="w-12 h-12 sm:w-16 sm:h-16" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* 用户信息 */}
        <div className="flex-1 min-w-0 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  {userProfile.full_name || userProfile.username}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">@{userProfile.username}</p>
              </div>

              {/* 个人简介 */}
              {userProfile.bio && (
                <p className="text-sm md:text-base leading-relaxed max-w-2xl">
                  {userProfile.bio}
                </p>
              )}

              {/* 附加信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {userProfile.website && (
                  <a 
                    href={userProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span className="truncate max-w-48">
                      {userProfile.website.replace(/^https?:\/\//, '')}
                    </span>
                  </a>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    加入于 {userProfile.created_at ? 
                      new Date(userProfile.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long'
                      }) : '未知'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 flex-shrink-0 justify-center lg:justify-start">
              {isOwnProfile ? (
                <>
                  <Link href="/my-works">
                    <Button variant="outline" size="sm" className="min-w-[100px]">
                      <Settings className="w-4 h-4 mr-2" />
                      管理作品
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="min-w-[80px]">
                      <Cog className="w-4 h-4 mr-2" />
                      设置
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
                    className="min-w-[80px]"
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
                </>
              )}
              
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
            </div>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {userStats.artworks}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">作品</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {userStats.followers}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">粉丝</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {userStats.following}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">关注</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {userStats.likes}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">获赞</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}