"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/lib/providers/auth-provider"
import { imageService } from "@/lib/services/image-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Edit, 
  Trash2, 
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageWithUser } from "@/lib/types/database"

export default function MyWorksPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [allImages, setAllImages] = useState<ImageWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 获取用户的所有作品
  const fetchUserImages = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const images = await imageService.getUserImages(user.id, 100, 0)
      setAllImages(images)
    } catch (error) {
      console.error('Error fetching user images:', error)
      toast.error("获取作品列表失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserImages()
  }, [user])

  // 发布作品
  const handlePublish = async (imageId: string) => {
    if (!user) return
    
    try {
      setActionLoading(imageId)
      await imageService.publishImage(imageId, user.id)
      toast.success("作品已发布")
      await fetchUserImages() // 刷新列表
    } catch (error) {
      console.error('Error publishing image:', error)
      toast.error("发布失败，请重试")
    } finally {
      setActionLoading(null)
    }
  }

  // 取消发布
  const handleUnpublish = async (imageId: string) => {
    if (!user) return
    
    try {
      setActionLoading(imageId)
      await imageService.unpublishImage(imageId, user.id)
      toast.success("作品已取消发布")
      await fetchUserImages() // 刷新列表
    } catch (error) {
      console.error('Error unpublishing image:', error)
      toast.error("取消发布失败，请重试")
    } finally {
      setActionLoading(null)
    }
  }

  // 删除作品
  const handleDelete = async (imageId: string) => {
    if (!user) return
    
    if (!confirm("确定要删除这个作品吗？此操作不可恢复。")) {
      return
    }
    
    try {
      setActionLoading(imageId)
      await imageService.deleteImage(imageId, user.id)
      toast.success("作品已删除")
      await fetchUserImages() // 刷新列表
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error("删除失败，请重试")
    } finally {
      setActionLoading(null)
    }
  }

  // 过滤已发布和草稿作品
  const publishedImages = allImages.filter(img => img.is_published)
  const draftImages = allImages.filter(img => !img.is_published)

  // 作品卡片组件
  const ImageCard = ({ image }: { image: ImageWithUser }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        <Image
          src={image.image_url}
          alt={image.title}
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          {image.is_published ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              已发布
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              草稿
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{image.title}</h3>
        
        {image.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {image.description}
          </p>
        )}
        
        {/* 统计信息 */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{image.view_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{image.like_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{image.comment_count}</span>
          </div>
        </div>
        
        {/* 创建时间 */}
        <div className="flex items-center text-xs text-muted-foreground mb-4">
          <Calendar className="w-3 h-3 mr-1" />
          {image.created_at ? new Date(image.created_at).toLocaleDateString('zh-CN') : '未知时间'}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-2">
          {image.is_published ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUnpublish(image.id)}
              disabled={actionLoading === image.id}
              className="flex-1"
            >
              {actionLoading === image.id ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Clock className="w-3 h-3 mr-1" />
              )}
              取消发布
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => handlePublish(image.id)}
              disabled={actionLoading === image.id}
              className="flex-1"
            >
              {actionLoading === image.id ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              发布
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(image.id)}
            disabled={actionLoading === image.id}
          >
            {actionLoading === image.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

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
                请先登录您的账户才能查看作品
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            我的作品
          </h1>
          <p className="text-lg text-muted-foreground">
            管理您的所有作品，控制发布状态
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                全部作品 ({allImages.length})
              </TabsTrigger>
              <TabsTrigger value="published">
                已发布 ({publishedImages.length})
              </TabsTrigger>
              <TabsTrigger value="drafts">
                草稿 ({draftImages.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {allImages.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">还没有作品</h3>
                  <p className="text-muted-foreground mb-4">
                    上传您的第一个作品开始创作之旅
                  </p>
                  <Button onClick={() => router.push('/upload')}>
                    上传作品
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allImages.map((image) => (
                    <ImageCard key={image.id} image={image} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="published" className="mt-6">
              {publishedImages.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">还没有已发布的作品</h3>
                  <p className="text-muted-foreground">
                    发布您的作品让更多人看到
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {publishedImages.map((image) => (
                    <ImageCard key={image.id} image={image} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="drafts" className="mt-6">
              {draftImages.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">没有草稿作品</h3>
                  <p className="text-muted-foreground">
                    所有作品都已发布
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {draftImages.map((image) => (
                    <ImageCard key={image.id} image={image} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  )
}