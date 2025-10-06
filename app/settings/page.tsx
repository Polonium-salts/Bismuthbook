'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Camera, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface UserProfile {
  username: string
  email: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    avatar_url: '',
    bio: '',
    location: '',
    website: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'privacy'>('profile')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile({
        username: data.username || '',
        email: data.email || user.email || '',
        avatar_url: data.avatar_url || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || ''
      })
    } catch (err) {
      console.error('获取用户资料失败:', err)
      setMessage({ type: 'error', text: '获取用户资料失败' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '请选择图片文件' })
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: '图片大小不能超过5MB' })
      return
    }

    setAvatarFile(file)
    
    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null

    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (err) {
      console.error('头像上传失败:', err)
      throw err
    }
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      let avatarUrl = profile.avatar_url

      // 如果有新头像，先上传
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
      }

      const { error } = await supabase
        .from('users')
        .update({
          username: profile.username,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          avatar_url: avatarUrl
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl || '' }))
      setAvatarFile(null)
      setAvatarPreview('')
      setMessage({ type: 'success', text: '个人资料已更新' })
    } catch (err) {
      console.error('保存失败:', err)
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '新密码和确认密码不匹配' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码至少需要6个字符' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setMessage({ type: 'success', text: '密码已更新' })
    } catch (err) {
      console.error('密码更新失败:', err)
      setMessage({ type: 'error', text: '密码更新失败，请重试' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('确定要删除账户吗？此操作不可撤销。')) return

    try {
      // 这里应该实现账户删除逻辑
      // 包括删除用户数据、作品等
      setMessage({ type: 'error', text: '账户删除功能暂未实现' })
    } catch (err) {
      console.error('删除账户失败:', err)
      setMessage({ type: 'error', text: '删除账户失败' })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-base-200 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-base-200 rounded"></div>
            <div className="h-12 bg-base-200 rounded"></div>
            <div className="h-12 bg-base-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">设置</h1>

      {/* 消息提示 */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 标签页 */}
      <div className="tabs tabs-boxed mb-8">
        <button
          className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          个人资料
        </button>
        <button
          className={`tab ${activeTab === 'account' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          账户设置
        </button>
        <button
          className={`tab ${activeTab === 'privacy' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          隐私设置
        </button>
      </div>

      {/* 个人资料标签页 */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="space-y-6">
          {/* 头像 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">头像</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 h-20 rounded-full">
                  {avatarPreview || profile.avatar_url ? (
                    <Image
                      src={avatarPreview || profile.avatar_url || ''}
                      alt="头像"
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center text-2xl">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="file-input file-input-bordered file-input-sm"
                />
                <p className="text-sm text-base-content/70 mt-1">
                  支持 JPG、PNG 格式，最大 5MB
                </p>
              </div>
            </div>
          </div>

          {/* 用户名 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">用户名</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={profile.username}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>

          {/* 邮箱 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">邮箱</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              value={profile.email}
              disabled
            />
            <label className="label">
              <span className="label-text-alt">邮箱地址不可修改</span>
            </label>
          </div>

          {/* 个人简介 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">个人简介</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              rows={4}
              placeholder="介绍一下你自己..."
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>

          {/* 位置 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">位置</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="你的位置"
              value={profile.location}
              onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* 网站 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">个人网站</span>
            </label>
            <input
              type="url"
              className="input input-bordered"
              placeholder="https://example.com"
              value={profile.website}
              onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${saving ? 'loading' : ''}`}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            保存更改
          </button>
        </form>
      )}

      {/* 账户设置标签页 */}
      {activeTab === 'account' && (
        <div className="space-y-8">
          {/* 修改密码 */}
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <h2 className="text-xl font-semibold">修改密码</h2>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">当前密码</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  className="input input-bordered w-full pr-10"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">新密码</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  className="input input-bordered w-full pr-10"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">确认新密码</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  className="input input-bordered w-full pr-10"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${saving ? 'loading' : ''}`}
              disabled={saving}
            >
              更新密码
            </button>
          </form>

          <div className="divider"></div>

          {/* 危险操作 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-error">危险操作</h2>
            
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <h3 className="font-medium text-error mb-2">删除账户</h3>
              <p className="text-sm text-base-content/70 mb-4">
                删除账户将永久删除你的所有数据，包括作品、评论、点赞等。此操作不可撤销。
              </p>
              <button
                className="btn btn-error btn-outline"
                onClick={handleDeleteAccount}
              >
                删除账户
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐私设置标签页 */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">隐私设置</h2>
          
          <div className="space-y-4">
            <div className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text">公开个人资料</span>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </label>
              <label className="label">
                <span className="label-text-alt">其他用户可以查看你的个人资料</span>
              </label>
            </div>

            <div className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text">显示在线状态</span>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </label>
              <label className="label">
                <span className="label-text-alt">其他用户可以看到你是否在线</span>
              </label>
            </div>

            <div className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text">允许关注</span>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </label>
              <label className="label">
                <span className="label-text-alt">其他用户可以关注你</span>
              </label>
            </div>

            <div className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text">接收邮件通知</span>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </label>
              <label className="label">
                <span className="label-text-alt">接收关于点赞、评论、关注的邮件通知</span>
              </label>
            </div>
          </div>

          <button className="btn btn-primary">
            保存隐私设置
          </button>
        </div>
      )}
    </div>
  )
}