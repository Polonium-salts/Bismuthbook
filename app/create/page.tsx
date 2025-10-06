'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import {
  PhotoIcon,
  XMarkIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

interface ImageFile {
  file: File
  preview: string
  id: string
}

export default function CreateArtworkPage() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [images, setImages] = useState<ImageFile[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // 暂时只支持单张图片
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const file = files[0]
      const id = Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)
      
      // 清除之前的图片
      images.forEach(img => URL.revokeObjectURL(img.preview))
      setImages([{ file, preview, id }])
    }
  }

  // 删除图片
  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter(img => img.id !== id)
    })
  }

  // 添加标签
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 10) {
      setTags(prev => [...prev, currentTag.trim()])
      setCurrentTag('')
    }
  }

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  // 处理键盘事件
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // 上传作品
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/login')
      return
    }

    if (images.length === 0) {
      alert('请至少上传一张图片')
      return
    }

    if (!title.trim()) {
      alert('请输入作品标题')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      console.log('开始上传，用户ID:', user.id)
      
      // 上传图片到Supabase Storage
      const image = images[0]
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${image.file.name.split('.').pop()}`
      const filePath = `artworks/${user.id}/${fileName}`
      
      console.log('准备上传文件:', fileName, '路径:', filePath)
      setUploadProgress(20)
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, image.file)
      
      if (error) {
        console.error('存储上传错误:', error)
        throw error
      }
      
      console.log('文件上传成功:', data)
      setUploadProgress(60)
      
      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      console.log('获取公共URL:', publicUrl)
      setUploadProgress(80)

      // 创建作品记录 - 使用posts表
      const postData = {
        content: `${title.trim()}\n\n${description.trim()}${tags.length > 0 ? '\n\n标签: ' + tags.join(', ') : ''}`,
        image_urls: [publicUrl],
        user_id: user.id
      }
      
      console.log('准备插入数据库:', postData)
      
      const { data: artwork, error: artworkError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (artworkError) {
        console.error('数据库插入错误:', artworkError)
        throw artworkError
      }

      console.log('作品创建成功:', artwork)
      setUploadProgress(100)
      
      // 跳转到作品详情页
      setTimeout(() => {
        router.push(`/artwork/${artwork.id}`)
      }, 1000)

    } catch (error) {
      console.error('上传失败详细信息:', error)
      alert(`上传失败: ${error.message || '未知错误'}`)
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content mb-4">请先登录</h1>
          <button 
            onClick={() => router.push('/login')}
            className="btn btn-primary"
          >
            前往登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg">
              <PaintBrushIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                发布作品
              </h1>
              <p className="text-base-content/60">
                分享你的创意作品给世界
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 图片上传区域 */}
          <div className="bg-base-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
              <PhotoIcon className="w-5 h-5" />
              作品图片
            </h2>
            
            {/* 图片预览网格 */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-base-300 rounded-xl overflow-hidden">
                      <img 
                        src={image.preview} 
                        alt={`预览 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-content text-xs px-2 py-1 rounded-full">
                        主图
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 bg-error text-error-content w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 上传按钮 */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-base-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300"
            >
              <CloudArrowUpIcon className="w-12 h-12 text-base-content/40 mx-auto mb-4" />
              <p className="text-base-content/60 mb-2">
                点击或拖拽图片到这里上传
              </p>
              <p className="text-sm text-base-content/40">
                支持 JPG、PNG、GIF 格式，最多上传 10 张图片
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* 作品信息 */}
          <div className="bg-base-200 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-base-content flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              作品信息
            </h2>

            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                作品标题 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的作品起个好听的名字..."
                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base-content"
                maxLength={100}
                required
              />
              <div className="text-right text-sm text-base-content/40 mt-1">
                {title.length}/100
              </div>
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                作品描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述一下你的创作灵感和过程..."
                rows={4}
                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base-content resize-none"
                maxLength={1000}
              />
              <div className="text-right text-sm text-base-content/40 mt-1">
                {description.length}/1000
              </div>
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-base-content mb-2 flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                标签 (最多10个)
              </label>
              
              {/* 已添加的标签 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-error transition-colors"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 添加标签输入框 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="输入标签名称..."
                  className="flex-1 px-4 py-2 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base-content"
                  maxLength={20}
                  disabled={tags.length >= 10}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!currentTag.trim() || tags.includes(currentTag.trim()) || tags.length >= 10}
                  className="btn btn-primary btn-sm px-4"
                >
                  添加
                </button>
              </div>
            </div>

            {/* 隐私设置 */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="checkbox checkbox-primary"
                />
                <div className="flex items-center gap-2">
                  {isPrivate ? (
                    <EyeSlashIcon className="w-5 h-5 text-base-content/60" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-base-content/60" />
                  )}
                  <span className="text-base-content">
                    {isPrivate ? '私密作品（仅自己可见）' : '公开作品（所有人可见）'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-ghost px-6"
              disabled={isUploading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isUploading || images.length === 0 || !title.trim()}
              className="btn btn-primary px-8 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  上传中... {uploadProgress}%
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  发布作品
                </>
              )}
            </button>
          </div>
        </form>

        {/* 上传进度条 */}
        {isUploading && (
          <div className="fixed bottom-4 right-4 bg-base-100 border border-base-300 rounded-xl p-4 shadow-lg min-w-80">
            <div className="flex items-center gap-3 mb-2">
              <span className="loading loading-spinner loading-sm text-primary"></span>
              <span className="text-base-content font-medium">正在上传作品...</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-base-content/60 mt-1">
              {uploadProgress}% 完成
            </div>
          </div>
        )}
      </div>
    </div>
  )
}