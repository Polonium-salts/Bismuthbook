'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/providers/auth-provider'
import { useImages } from '@/lib/hooks/use-images'
import { imageService } from '@/lib/services/image-service'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Tag, 
  FileText, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { user } = useAuth()
  const { refresh } = useImages()
  
  // 状态管理
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // 文件选择处理
  const handleFileSelect = useCallback((file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小不能超过 10MB')
      return
    }

    setSelectedFile(file)
    
    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  // 拖拽处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // 标签管理
  const addTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }, [tagInput, tags])

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }, [tags])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }, [addTag])

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !user || !title.trim()) {
      toast.error('请填写必要信息')
      return
    }

    setUploading(true)
    setUploadStatus('uploading')
    setUploadProgress(0)

    let progressInterval: NodeJS.Timeout | null = null

    try {
      // 改进的进度模拟 - 分阶段进行
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 30) {
            // 文件读取阶段
            return prev + Math.random() * 8 + 2
          } else if (prev < 70) {
            // 文件上传阶段
            return prev + Math.random() * 5 + 1
          } else if (prev < 85) {
            // 数据库写入阶段
            return prev + Math.random() * 3 + 0.5
          } else {
            // 最后阶段，等待完成
            return Math.min(prev + Math.random() * 1, 94)
          }
        })
      }, 150)

      // 上传图片和数据
      await imageService.uploadImageWithData(selectedFile, {
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        category: category.trim() || undefined
      }, user.id)

      // 清除进度定时器
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }

      // 完成上传
      setUploadProgress(100)
      setUploadStatus('success')
      
      toast.success('图片上传成功！')
      
      // 刷新图片列表
      try {
        await refresh()
      } catch (refreshError) {
        console.warn('Failed to refresh images:', refreshError)
        // 即使刷新失败也不影响上传成功的状态
      }
      
      // 延迟关闭模态框
      setTimeout(() => {
        handleClose()
      }, 1500)

    } catch (error) {
      console.error('Upload error:', error)
      
      // 清除进度定时器
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      
      setUploadStatus('error')
      setUploadProgress(0) // 重置进度
      
      // 更详细的错误信息
      let errorMessage = '上传失败，请重试'
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          errorMessage = '文件上传失败，请检查网络连接'
        } else if (error.message.includes('database')) {
          errorMessage = '数据保存失败，请重试'
        } else if (error.message.includes('timeout')) {
          errorMessage = '上传超时，请检查网络连接后重试'
        }
      }
      
      toast.error(errorMessage)
    } finally {
      // 确保清理定时器
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setUploading(false)
    }
  }

  // 关闭模态框
  const handleClose = useCallback(() => {
    if (uploading) return
    
    setSelectedFile(null)
    setPreview(null)
    setTitle('')
    setDescription('')
    setTags([])
    setTagInput('')
    setCategory('')
    setUploadProgress(0)
    setUploadStatus('idle')
    onClose()
  }, [uploading, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Camera className="h-6 w-6 text-primary" />
            上传图片
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 文件上传区域 */}
          <div className="space-y-4">
            {!selectedFile ? (
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">点击或拖拽上传图片</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      支持 JPG、PNG、WebP、GIF 格式，最大 10MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden bg-muted">
                  <Image
                    src={preview!}
                    alt="预览"
                    width={400}
                    height={256}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/90 text-black hover:bg-white"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      更换图片
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
              className="hidden"
            />
          </div>

          {/* 表单字段 */}
          <div className="space-y-4">
            {/* 标题 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                标题 *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="为你的图片起个好听的名字..."
                maxLength={100}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述一下这张图片的故事..."
                maxLength={500}
                rows={3}
                className="resize-none transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 分类 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">分类</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例如：风景、人物、动物..."
                maxLength={50}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                标签 ({tags.length}/10)
              </label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="添加标签..."
                  maxLength={20}
                  className="flex-1 transition-all focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 10}
                  size="sm"
                  className="px-4"
                >
                  添加
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 上传进度 */}
          {uploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {uploadStatus === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {uploadStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {uploadStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {uploadStatus === 'uploading' && '上传中...'}
                  {uploadStatus === 'success' && '上传成功！'}
                  {uploadStatus === 'error' && '上传失败'}
                </span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || !title.trim() || uploading}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  上传图片
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}