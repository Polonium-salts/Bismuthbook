'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Upload, Save, Loader2, User, Bell, Shield, Palette } from 'lucide-react'
import { useAuth } from '@/lib/providers/auth-provider'
import { authService } from '@/lib/services/auth-service'
import { settingsService, UserSettings } from '@/lib/services/settings-service'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, profile: userProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar_url: ''
  })
  
  // 用户名验证状态
  const [usernameValidation, setUsernameValidation] = useState({
    isChecking: false,
    isValid: true,
    message: '',
    originalUsername: ''
  })

  // 加载用户设置和资料
  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        // 加载用户设置
        const userSettings = await settingsService.getUserSettings(user.id)
        setSettings(userSettings)
        
        // 加载用户资料
        if (userProfile) {
          setProfileData({
            username: userProfile.username || '',
            email: user.email || '',
            bio: userProfile.bio || '',
            avatar_url: userProfile.avatar_url || ''
          })
          
          // 保存原始用户名用于验证
          setUsernameValidation(prev => ({
            ...prev,
            originalUsername: userProfile.username || ''
          }))
        }
      } catch (error) {
        console.error('加载设置失败:', error)
        toast.error('加载设置失败')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, userProfile])

  // 用户名验证函数
  const validateUsername = useCallback(async (username: string) => {
    if (!user || !username.trim()) {
      setUsernameValidation(prev => ({
        ...prev,
        isValid: false,
        message: '用户名不能为空'
      }))
      return false
    }

    // 检查用户名格式
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!usernameRegex.test(username)) {
      setUsernameValidation(prev => ({
        ...prev,
        isValid: false,
        message: '用户名只能包含字母、数字、下划线和连字符，长度3-20个字符'
      }))
      return false
    }

    // 如果用户名没有改变，直接返回有效
    if (username === usernameValidation.originalUsername) {
      setUsernameValidation(prev => ({
        ...prev,
        isValid: true,
        message: ''
      }))
      return true
    }

    // 检查用户名是否可用
    try {
      setUsernameValidation(prev => ({ ...prev, isChecking: true }))
      const isAvailable = await authService.isUsernameAvailable(username, user.id)
      
      if (isAvailable) {
        setUsernameValidation(prev => ({
          ...prev,
          isValid: true,
          message: '用户名可用',
          isChecking: false
        }))
        return true
      } else {
        setUsernameValidation(prev => ({
          ...prev,
          isValid: false,
          message: '用户名已被使用',
          isChecking: false
        }))
        return false
      }
    } catch {
      setUsernameValidation(prev => ({
        ...prev,
        isValid: false,
        message: '验证用户名时出错',
        isChecking: false
      }))
      return false
    }
  }, [user, usernameValidation.originalUsername])

  // 防抖的用户名验证
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profileData.username && profileData.username !== usernameValidation.originalUsername) {
        validateUsername(profileData.username)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [profileData.username, usernameValidation.originalUsername, user, validateUsername])

  // 保存用户资料
  const handleSaveProfile = async () => {
    if (!user) return
    
    // 验证用户名
    const isUsernameValid = await validateUsername(profileData.username)
    if (!isUsernameValid) {
      toast.error('请修正用户名错误后再保存')
      return
    }
    
    try {
      setLoading(true)
      
      await authService.updateUserProfile(user.id, {
        username: profileData.username,
        bio: profileData.bio,
        fullName: profileData.username  // 将显示名称设置为与用户名相同
      })
      
      // 更新原始用户名
      setUsernameValidation(prev => ({
        ...prev,
        originalUsername: profileData.username
      }))
      
      await refreshProfile()
      toast.success('个人资料已保存')
    } catch (error) {
      console.error('保存个人资料失败:', error)
      toast.error('保存个人资料失败')
    } finally {
      setLoading(false)
    }
  }

  // 保存设置
  const handleSaveSettings = async (settingsUpdate: Partial<UserSettings>) => {
    if (!user || !settings) return
    
    try {
      setLoading(true)
      
      const updatedSettings = await settingsService.updateUserSettings(user.id, settingsUpdate)
      setSettings(updatedSettings)
      toast.success('设置已保存')
    } catch (error) {
      console.error('保存设置失败:', error)
      toast.error('保存设置失败')
    } finally {
      setLoading(false)
    }
  }

  // 头像上传
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      setLoading(true)
      const avatarUrl = await authService.uploadAvatar(user.id, file)
      setProfileData(prev => ({ ...prev, avatar_url: avatarUrl }))
      toast.success('头像上传成功')
    } catch (error) {
      console.error('头像上传失败:', error)
      toast.error('头像上传失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <p className="text-muted-foreground">请先登录以访问设置页面</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (loading && !settings) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">加载设置中...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">设置</h1>
        <p className="text-muted-foreground mt-2">
          管理您的账户设置和偏好
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            个人资料
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            通知
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            隐私
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            显示
          </TabsTrigger>
        </TabsList>

        {/* 个人资料设置 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>
                管理您的个人信息和头像
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 头像设置 */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.avatar_url} />
                  <AvatarFallback>
                    {profileData.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        上传头像
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <p className="text-sm text-muted-foreground">
                    支持 JPG、PNG 格式，最大 5MB
                  </p>
                </div>
              </div>

              <Separator />

              {/* 基本信息 */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">用户名</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="输入用户名"
                      className={`pr-10 ${
                        usernameValidation.isChecking 
                          ? 'border-yellow-300' 
                          : usernameValidation.isValid 
                            ? profileData.username && profileData.username !== usernameValidation.originalUsername
                              ? 'border-green-500' 
                              : ''
                            : 'border-red-500'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {usernameValidation.isChecking ? (
                        <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                      ) : usernameValidation.isValid ? (
                        profileData.username && profileData.username !== usernameValidation.originalUsername && (
                          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                        )
                      ) : (
                        profileData.username && (
                          <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                            <div className="h-1 w-2 bg-white rounded"></div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  {usernameValidation.message && (
                    <p className={`text-sm ${
                      usernameValidation.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {usernameValidation.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    邮箱地址无法修改
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="介绍一下自己..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={loading || usernameValidation.isChecking || !usernameValidation.isValid}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : usernameValidation.isChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      验证中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      保存资料
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>
                管理您接收通知的方式和类型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>邮件通知</Label>
                    <p className="text-sm text-muted-foreground">
                      接收重要更新的邮件通知
                    </p>
                  </div>
                  <Switch
                    checked={settings?.emailNotifications || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>推送通知</Label>
                    <p className="text-sm text-muted-foreground">
                      接收浏览器推送通知
                    </p>
                  </div>
                  <Switch
                    checked={settings?.pushNotifications || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>新关注者通知</Label>
                    <p className="text-sm text-muted-foreground">
                      有人关注您时接收通知
                    </p>
                  </div>
                  <Switch
                    checked={settings?.followNotifications || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ followNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>评论通知</Label>
                    <p className="text-sm text-muted-foreground">
                      有人评论您的作品时接收通知
                    </p>
                  </div>
                  <Switch
                    checked={settings?.commentNotifications || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ commentNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>点赞通知</Label>
                    <p className="text-sm text-muted-foreground">
                      有人点赞您的作品时接收通知
                    </p>
                  </div>
                  <Switch
                    checked={settings?.likeNotifications || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ likeNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>每周摘要</Label>
                    <p className="text-sm text-muted-foreground">
                      接收每周活动摘要邮件
                    </p>
                  </div>
                  <Switch
                    checked={settings?.weeklyDigest || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ weeklyDigest: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 隐私设置 */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>隐私设置</CardTitle>
              <CardDescription>
                控制您的信息和内容的可见性
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>个人资料可见性</Label>
                  <Select
                    value={settings?.profileVisibility || 'public'}
                    onValueChange={(value) => 
                      handleSaveSettings({ profileVisibility: value as 'public' | 'followers' | 'private' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">公开</SelectItem>
                      <SelectItem value="followers">仅关注者</SelectItem>
                      <SelectItem value="private">私密</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>显示邮箱</Label>
                    <p className="text-sm text-muted-foreground">
                      在个人资料中显示邮箱地址
                    </p>
                  </div>
                  <Switch
                    checked={settings?.showEmail || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ showEmail: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>显示位置</Label>
                    <p className="text-sm text-muted-foreground">
                      在个人资料中显示位置信息
                    </p>
                  </div>
                  <Switch
                    checked={settings?.showLocation || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ showLocation: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>允许私信</Label>
                    <p className="text-sm text-muted-foreground">
                      允许其他用户向您发送私信
                    </p>
                  </div>
                  <Switch
                    checked={settings?.allowDirectMessages || true}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ allowDirectMessages: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>显示在线状态</Label>
                    <p className="text-sm text-muted-foreground">
                      让其他用户看到您的在线状态
                    </p>
                  </div>
                  <Switch
                    checked={settings?.showOnlineStatus || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ showOnlineStatus: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 显示设置 */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>显示设置</CardTitle>
              <CardDescription>
                自定义界面外观和语言偏好
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>主题</Label>
                  <Select
                    value={settings?.theme || 'system'}
                    onValueChange={(value) => 
                      handleSaveSettings({ theme: value as 'light' | 'dark' | 'system' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">浅色</SelectItem>
                      <SelectItem value="dark">深色</SelectItem>
                      <SelectItem value="system">跟随系统</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>语言</Label>
                  <Select
                    value={settings?.language || 'zh-CN'}
                    onValueChange={(value) => 
                      handleSaveSettings({ language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">简体中文</SelectItem>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>网格大小</Label>
                  <Select
                    value={settings?.gridSize || 'medium'}
                    onValueChange={(value) => 
                      handleSaveSettings({ gridSize: value as 'small' | 'medium' | 'large' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">小</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="large">大</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>显示 NSFW 内容</Label>
                    <p className="text-sm text-muted-foreground">
                      显示可能包含敏感内容的作品
                    </p>
                  </div>
                  <Switch
                    checked={settings?.showNSFW || false}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ showNSFW: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自动播放 GIF</Label>
                    <p className="text-sm text-muted-foreground">
                      自动播放动态图片
                    </p>
                  </div>
                  <Switch
                    checked={settings?.autoplayGifs || true}
                    onCheckedChange={(checked) => 
                      handleSaveSettings({ autoplayGifs: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </MainLayout>
  )
}