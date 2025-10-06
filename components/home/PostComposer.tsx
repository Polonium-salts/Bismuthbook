'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { api } from '@/lib/supabase'
import { 
  PhotoIcon, 
  FaceSmileIcon, 
  MapPinIcon,
  UserCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

interface PostComposerProps {
  className?: string
  onPostSuccess?: () => void
}

export function PostComposer({ className, onPostSuccess }: PostComposerProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })
    
    setSelectedImages(prev => [...prev, ...validFiles].slice(0, 4)) // 最多4张图片
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isPosting || isUploading) return

    setIsPosting(true)
    setIsUploading(true)
    
    try {
      let imageUrls: string[] = []
      
      // 上传图片
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(file => api.uploadImage(file))
        imageUrls = await Promise.all(uploadPromises)
      }
      
      // 创建帖子
      await api.createPost(content.trim(), imageUrls)
      
      // 重置表单
      setContent('')
      setSelectedImages([])
      onPostSuccess?.()
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败，请重试')
    } finally {
      setIsPosting(false)
      setIsUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-base-100 rounded-2xl border border-base-200/50 p-6 shadow-sm">
        <div className="text-center">
          <p className="text-base-content/60 mb-4">登录后即可分享你的创作动态</p>
          <div className="flex gap-3 justify-center">
            <a href="/login" className="btn btn-primary btn-sm">登录</a>
            <a href="/register" className="btn btn-outline btn-sm">注册</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-base-100 rounded-2xl border border-base-200/50 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          {/* 用户头像 */}
          <div className="flex-shrink-0">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt={user.user_metadata?.username || user.email}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-primary-content" />
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的创作灵感、作品进展或艺术心得..."
              className="w-full min-h-[120px] p-4 bg-base-200/50 border border-base-300/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-base-content placeholder:text-base-content/50 transition-all duration-300"
              maxLength={280}
            />
            
            {/* 图片预览 */}
            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`预览 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-base-300/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-error/80 hover:bg-error text-error-content rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* 字数统计 */}
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 4 || isUploading}
                  className="p-2 hover:bg-base-200/70 rounded-lg transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  title="添加图片"
                >
                  <PhotoIcon className="w-5 h-5 text-base-content/60 group-hover:text-primary transition-colors" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-base-200/70 rounded-lg transition-colors duration-200 group"
                  title="添加表情"
                >
                  <FaceSmileIcon className="w-5 h-5 text-base-content/60 group-hover:text-primary transition-colors" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-base-200/70 rounded-lg transition-colors duration-200 group"
                  title="添加位置"
                >
                  <MapPinIcon className="w-5 h-5 text-base-content/60 group-hover:text-primary transition-colors" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-sm ${content.length > 250 ? 'text-warning' : content.length > 280 ? 'text-error' : 'text-base-content/50'}`}>
                  {content.length}/280
                </span>
                <button
                  type="submit"
                  disabled={!content.trim() || isPosting || isUploading || content.length > 280}
                  className="btn btn-primary btn-sm px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPosting || isUploading ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      {isUploading ? '上传中...' : '发布中...'}
                    </>
                  ) : (
                    '发布动态'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}