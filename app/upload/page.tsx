"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/providers/auth-provider"
import { imageService } from "@/lib/services/image-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Camera, Palette, Sparkles, Home, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    category: ""
  })

  // 预设分类
  const categories = [
    "插画", "摄影", "设计", "数字艺术", "传统艺术", "概念艺术", "角色设计", "场景设计", "其他"
  ]

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        
        // 创建预览
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        
        // 自动填充标题（去掉扩展名）
        const fileName = file.name.replace(/\.[^/.]+$/, "")
        setFormData(prev => ({ ...prev, title: fileName }))
      } else {
        toast.error("请选择图片文件")
      }
    }
  }

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      const fileName = file.name.replace(/\.[^/.]+$/, "")
      setFormData(prev => ({ ...prev, title: fileName }))
    }
  }

  // 移除文件
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setUploadProgress(0)
    setUploadSuccess(false)
  }

  // 处理表单输入
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 处理标签输入
  const handleTagsChange = (value: string) => {
    setFormData(prev => ({ ...prev, tags: value }))
  }

  // 获取标签数组
  const getTagsArray = () => {
    return formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  }



  // 上传图片
  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast.error("请选择文件并登录")
      return
    }

    if (!formData.title.trim()) {
      toast.error("请输入作品标题")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const result = await imageService.uploadImageWithData(
        selectedFile,
        {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          tags: getTagsArray(),
          category: formData.category || undefined,
          isPublished: false
        },
        user.id
      )

      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadSuccess(true)
      
      toast.success("作品已保存为草稿！")
      
      // 2秒后跳转到首页
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error("上传失败，请重试")
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  // 如果用户未登录
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <CardTitle>需要登录</CardTitle>
              <CardDescription>
                请先登录您的账户才能上传作品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/')} 
                className="w-full"
              >
                返回首页
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              发布作品
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            上传您的作品，填写详细信息后发布
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：文件上传区域 */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>选择图片</span>
              </CardTitle>
              <CardDescription>
                支持 JPG、PNG、GIF 格式，最大 10MB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">拖拽图片到这里</p>
                  <p className="text-sm text-muted-foreground mb-4">或者点击选择文件</p>
                  <Button variant="outline">
                    选择图片
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 图片预览 */}
                  <div className="relative">
                    <img
                      src={preview!}
                      alt="预览"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {!uploading && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    {uploadSuccess && (
                      <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <div className="bg-white rounded-full p-3">
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 文件信息 */}
                  <div className="text-sm text-muted-foreground">
                    <p>文件名: {selectedFile.name}</p>
                    <p>大小: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>

                  {/* 上传进度 */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>上传进度</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 右侧：作品信息表单 */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>作品信息</span>
              </CardTitle>
              <CardDescription>
                {uploadSuccess ? "作品已发布成功！" : uploading ? "正在上传..." : "填写作品信息，然后点击发布"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">作品标题</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="为您的作品起一个吸引人的标题"
                  disabled={uploading || uploadSuccess}
                />
              </div>

              {/* 描述 */}
              <div className="space-y-2">
                <Label htmlFor="description">作品描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="描述您的创作灵感、使用的技法或想要表达的内容..."
                  rows={4}
                  disabled={uploading || uploadSuccess}
                />
              </div>

              {/* 分类 */}
              <div className="space-y-2">
                <Label>作品分类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={uploading || uploadSuccess}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择作品分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 标签 */}
              <div className="space-y-2">
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="用逗号分隔多个标签，如：插画,角色设计,原创"
                  disabled={uploading || uploadSuccess}
                />
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getTagsArray().map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                {uploadSuccess ? (
                  <>
                    <Button
                       onClick={() => router.push('/')}
                       className="flex-1"
                       size="lg"
                     >
                       <Home className="w-4 h-4 mr-2" />
                       返回首页
                     </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      重新上传
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="w-full"
                    size="lg"
                  >
                    {uploading ? (
                       <>
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                         上传中... {uploadProgress}%
                       </>
                     ) : (
                       <>
                         <Upload className="w-4 h-4 mr-2" />
                         发布作品
                       </>
                     )}
                  </Button>
                )}
              </div>

              {uploadSuccess && (
                <p className="text-sm text-green-600 text-center">
                  作品上传成功！即将跳转到首页...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}