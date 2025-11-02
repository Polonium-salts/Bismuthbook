"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Calendar, 
  Link as LinkIcon, 
  Edit3,
  Camera,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/providers/auth-provider"
import { UserProfile as UserProfileType } from "@/lib/types/database"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface UserProfileProps {
  children: React.ReactNode
}

interface UserStats {
  artworks: number
  followers: number
  following: number
  likes: number
}

export function UserProfile({ children }: UserProfileProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    artworks: 0,
    followers: 0,
    following: 0,
    likes: 0
  })
  const [profileData, setProfileData] = useState({
    username: "",
    full_name: "",
    bio: "",
    website: ""
  })

  // 获取用户资料
  const fetchUserProfile = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) throw error

      setUserProfile(profile)
      setProfileData({
        username: profile?.username || "",
        full_name: profile?.full_name || "",
        bio: profile?.bio || "",
        website: profile?.website || ""
      })

      // 获取用户统计数据
      await fetchUserStats(user.id)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('获取用户资料失败')
    } finally {
      setLoading(false)
    }
  }, [user])

  // 获取用户统计数据
  const fetchUserStats = async (userId: string) => {
    try {
      // 获取作品数量
      const { count: artworksCount } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // 获取总点赞数
      const { data: images } = await supabase
        .from('images')
        .select('like_count')
        .eq('user_id', userId)

      const totalLikes = images?.reduce((sum, img) => sum + (img.like_count || 0), 0) || 0

      setUserStats({
        artworks: artworksCount || 0,
        followers: 0, // TODO: 实现关注系统
        following: 0, // TODO: 实现关注系统
        likes: totalLikes
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  // 保存用户资料
  const handleSave = async () => {
    if (!user || !userProfile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: profileData.username,
          full_name: profileData.full_name,
          bio: profileData.bio,
          website: profileData.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setUserProfile(prev => prev ? {
        ...prev,
        username: profileData.username,
        full_name: profileData.full_name,
        bio: profileData.bio,
        website: profileData.website
      } : null)

      setIsEditing(false)
      toast.success('资料更新成功')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('更新资料失败')
    } finally {
      setSaving(false)
    }
  }

  const updateProfileData = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user, fetchUserProfile])

  if (!user) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>用户资料</DialogTitle>
          <DialogDescription>
            查看和编辑您的个人信息
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* 头像和基本信息 */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userProfile?.avatar_url || ""} alt={userProfile?.username || ""} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {!isEditing ? (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">
                      {userProfile?.full_name || userProfile?.username || "未设置"}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{userProfile?.username}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-sm space-y-3">
                    <div>
                      <Label htmlFor="username">用户名</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => updateProfileData("username", e.target.value)}
                        placeholder="设置用户名"
                      />
                    </div>
                    <div>
                      <Label htmlFor="full_name">显示名称</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => updateProfileData("full_name", e.target.value)}
                        placeholder="设置显示名称"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && (
            <>
              <Separator />

              {/* 统计信息 */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{userStats.artworks}</div>
                  <div className="text-xs text-muted-foreground">作品</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.followers}</div>
                  <div className="text-xs text-muted-foreground">粉丝</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.following}</div>
                  <div className="text-xs text-muted-foreground">关注</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.likes}</div>
                  <div className="text-xs text-muted-foreground">获赞</div>
                </div>
              </div>

              <Separator />

              {/* 详细信息 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio">个人简介</Label>
                  {!isEditing ? (
                    <p className="text-sm mt-1">
                      {userProfile?.bio || "这个人很懒，什么都没有留下..."}
                    </p>
                  ) : (
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => updateProfileData("bio", e.target.value)}
                      placeholder="介绍一下自己..."
                      className="mt-1"
                    />
                  )}
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    {!isEditing ? (
                      userProfile?.website ? (
                        <a 
                          href={userProfile.website} 
                          className="text-sm text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {userProfile.website}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">未设置网站</span>
                      )
                    ) : (
                      <Input
                        value={profileData.website}
                        onChange={(e) => updateProfileData("website", e.target.value)}
                        placeholder="个人网站"
                        className="flex-1"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      加入于 {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('zh-CN') : '未知'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 操作按钮 */}
          {!loading && (
            <div className="flex gap-2 pt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex-1">
                  <Edit3 className="mr-2 h-4 w-4" />
                  编辑资料
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      // 重置表单数据
                      if (userProfile) {
                        setProfileData({
                          username: userProfile.username || "",
                          full_name: userProfile.full_name || "",
                          bio: userProfile.bio || "",
                          website: userProfile.website || ""
                        })
                      }
                    }} 
                    className="flex-1"
                    disabled={saving}
                  >
                    取消
                  </Button>
                  <Button onClick={handleSave} className="flex-1" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      "保存"
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}