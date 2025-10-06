'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react'

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    router.push('/login')
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过10MB')
      return
    }

    setSelectedFile(file)
    setError('')

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !user) return

    setLoading(true)
    setError('')

    try {
      // 上传图片到Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `artworks/${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(filePath)

      // 保存作品信息到数据库
      const { error: dbError } = await supabase
        .from('artworks')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          image_url: publicUrl,
          tags: tags.length > 0 ? tags : null,
          is_public: isPublic,
          user_id: user.id
        })

      if (dbError) throw dbError

      // 成功后重定向
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body">
          <h1 className="card-title text-2xl mb-6 text-base-content">上传作品</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            {/* 图片上传区域 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">作品图片 *</span>
              </label>
              
              {!previewUrl ? (
                <div
                  className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-base-50 transition-all duration-200"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-base-content/60" />
                  <p className="text-lg font-medium mb-2 text-base-content">点击上传图片</p>
                  <p className="text-sm text-base-content/70">
                    支持 JPG、PNG、GIF 格式，最大 10MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative aspect-video max-w-md mx-auto rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="预览"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-circle btn-sm btn-error absolute top-2 right-2"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                required
              />
            </div>

            {/* 标题 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">作品标题 *</span>
              </label>
              <input
                type="text"
                placeholder="给你的作品起个好听的名字"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
              />
              <label className="label">
                <span className="label-text-alt">{title.length}/100</span>
              </label>
            </div>

            {/* 描述 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">作品描述</span>
              </label>
              <textarea
                placeholder="描述你的创作灵感、使用的技法等..."
                className="textarea textarea-bordered h-24"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
              <label className="label">
                <span className="label-text-alt">{description.length}/1000</span>
              </label>
            </div>

            {/* 标签 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">标签</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="添加标签"
                  className="input input-bordered flex-1"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  maxLength={20}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tags.length >= 10}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <div key={index} className="badge badge-primary gap-2">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="btn btn-ghost btn-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <label className="label">
                <span className="label-text-alt">最多添加10个标签，每个标签最多20个字符</span>
              </label>
            </div>

            {/* 可见性设置 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">可见性</span>
              </label>
              <div className="flex gap-4">
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    className="radio radio-primary"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                  />
                  <span className="label-text ml-2">公开 - 所有人都可以看到</span>
                </label>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    className="radio radio-primary"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                  />
                  <span className="label-text ml-2">私密 - 只有你可以看到</span>
                </label>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="card-actions justify-end">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.back()}
              >
                取消
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading || !selectedFile || !title.trim()}
              >
                {loading ? '上传中...' : '发布作品'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}