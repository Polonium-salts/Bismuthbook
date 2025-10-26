"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Download, 
  MessageCircle, 
  Send,
  MoreHorizontal,
  Calendar,
  Eye,
  User
} from "lucide-react"
import { useAuth } from "@/lib/providers/auth-provider"
import { useInteractions } from "@/lib/hooks/use-interactions"
import { useComments } from "@/lib/hooks/use-interactions"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { ImageWithUserAndStats, Comment, CommentWithUser } from "@/lib/types/database"

interface ImageDetailProps {
  image: ImageWithUserAndStats | null
  isOpen: boolean
  onClose: () => void
}



export function ImageDetail({ image, isOpen, onClose }: ImageDetailProps) {
  const { user } = useAuth()
  const { viewCount, commentCount, likeCount, isLiked, isFavorited, toggleLike, toggleFavorite, loadStats } = useInteractions(image?.id)
  const { comments, isLoading: isLoadingComments, isSubmitting: isSubmittingComment, addComment, loadComments } = useComments(image?.id)
  
  const [newComment, setNewComment] = useState<string>("")

  // 加载统计数据
  useEffect(() => {
    if (image?.id) {
      loadStats()
    }
  }, [image?.id, loadStats])

  // useInteractions hook 已经处理了点赞和收藏状态的加载

  // 获取评论
  useEffect(() => {
    if (image?.id) {
      loadComments()
    }
  }, [image?.id, loadComments])



  const handleLike = async () => {
    if (!user) {
      toast.error("请先登录")
      return
    }

    try {
      await toggleLike()
      toast.success(isLiked ? "取消点赞" : "点赞成功")
    } catch (error) {
      toast.error("操作失败，请重试")
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      toast.error("请先登录")
      return
    }

    try {
      await toggleFavorite()
      toast.success(isFavorited ? "取消收藏" : "收藏成功")
    } catch (error) {
      toast.error("操作失败，请重试")
    }
  }

  const handleShare = async () => {
    if (!image) return

    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('链接已复制到剪贴板')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const handleDownload = () => {
    if (!image) return

    const link = document.createElement('a')
    link.href = image.image_url
    link.download = `${image.title || 'image'}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('开始下载')
  }

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("请先登录")
      return
    }

    if (!newComment.trim()) {
      toast.error("评论内容不能为空")
      return
    }

    try {
      const success = await addComment(newComment.trim())
      if (success) {
        setNewComment("")
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!image) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* 左侧：图片 */}
          <div className="relative bg-black flex items-center justify-center">
            <img
              src={image.image_url}
              alt={image.title || "图片"}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* 右侧：详情信息 */}
          <div className="flex flex-col h-full">
            {/* 头部：作者信息 */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={image.user_profiles?.avatar_url} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {image.user_profiles?.full_name || image.user_profiles?.username || '匿名用户'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{image.user_profiles?.username || 'anonymous'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 中间：图片信息和操作 */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* 图片标题和描述 */}
                  {image.title && (
                    <div>
                      <h2 className="text-xl font-bold">{image.title}</h2>
                    </div>
                  )}
                  
                  {image.description && (
                    <div>
                      <p className="text-muted-foreground">{image.description}</p>
                    </div>
                  )}

                  {/* 标签 */}
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {image.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* 统计信息 */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{viewCount || 0} 次浏览</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{commentCount || 0} 条评论</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(image.created_at)}</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={handleLike}
                        className="flex items-center space-x-1"
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{likeCount || 0}</span>
                      </Button>
                      
                      <Button
                        variant={isFavorited ? "default" : "outline"}
                        size="sm"
                        onClick={handleFavorite}
                      >
                        <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* 评论区 */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5" />
                      <h3 className="font-semibold">评论 ({commentCount || 0})</h3>
                    </div>

                    {/* 发表评论 */}
                    {user && (
                      <div className="flex space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder="写下你的评论..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={handleSubmitComment}
                              disabled={!newComment.trim() || isSubmittingComment}
                            >
                              {isSubmittingComment ? (
                                "发布中..."
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-1" />
                                  发布
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 评论列表 */}
                    <div className="space-y-4">
                      {isLoadingComments ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">加载评论中...</p>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">暂无评论，快来抢沙发吧！</p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.user_profiles?.avatar_url} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm">
                                  {comment.user_profiles?.full_name || comment.user_profiles?.username || '匿名用户'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}