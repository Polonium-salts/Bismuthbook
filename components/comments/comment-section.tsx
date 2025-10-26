"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Reply,
  Flag,
  Trash2,
  Edit
} from "lucide-react"

interface Comment {
  id: string
  user: {
    name: string
    avatar: string
    isArtist?: boolean
    isVerified?: boolean
  }
  content: string
  likes: number
  isLiked: boolean
  createdAt: string
  replies?: Comment[]
  isEdited?: boolean
}

interface CommentSectionProps {
  artworkId: string
  comments: Comment[]
  currentUser?: {
    name: string
    avatar: string
  }
  isLoading?: boolean
  isSubmitting?: boolean
  onAddComment?: (content: string) => Promise<boolean>
  onUpdateComment?: (commentId: string, content: string) => Promise<boolean>
  onDeleteComment?: (commentId: string) => Promise<boolean>
}

export function CommentSection({ 
  artworkId, 
  comments, 
  currentUser, 
  isLoading = false,
  isSubmitting = false,
  onAddComment,
  onUpdateComment,
  onDeleteComment
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser) return

    if (onAddComment) {
      const success = await onAddComment(newComment.trim())
      if (success) {
        setNewComment("")
      }
    }
  }

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim() || !currentUser) return

    const reply: Comment = {
      id: Date.now().toString(),
      user: currentUser,
      content: replyContent,
      likes: 0,
      isLiked: false,
      createdAt: "刚刚"
    }

    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        }
      }
      return comment
    }))

    setReplyContent("")
    setReplyingTo(null)
  }

  const handleLikeComment = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies?.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                }
              }
              return reply
            })
          }
        }
        return comment
      }))
    } else {
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        }
        return comment
      }))
    }
  }

  const CommentItem = ({ 
    comment, 
    isReply = false, 
    parentId 
  }: { 
    comment: Comment
    isReply?: boolean
    parentId?: string 
  }) => (
    <div className={`space-y-3 ${isReply ? "ml-6 sm:ml-12" : ""}`}>
      <div className="flex gap-2 sm:gap-3">
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback className="text-xs sm:text-sm">{comment.user.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span className="font-semibold text-xs sm:text-sm truncate">{comment.user.name}</span>
            {comment.user.isArtist && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                艺术家
              </Badge>
            )}
            {comment.user.isVerified && (
              <Badge variant="default" className="text-xs px-1 py-0">
                已认证
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground">(已编辑)</span>
            )}
          </div>
          
          <p className="text-xs sm:text-sm leading-relaxed break-words">{comment.content}</p>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
            >
              <Heart className={`mr-1 h-3 w-3 ${comment.isLiked ? "fill-current text-red-500" : ""}`} />
              {comment.likes > 0 && comment.likes}
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              >
                <Reply className="mr-1 h-3 w-3" />
                回复
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {currentUser?.name === comment.user.name ? (
                  <>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>
                    <Flag className="mr-2 h-4 w-4" />
                    举报
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* 回复输入框 */}
          {replyingTo === comment.id && (
            <div className="space-y-2 pt-2">
              <Textarea
                placeholder={`回复 ${comment.user.name}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim()}
                >
                  回复
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyContent("")
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3 mt-4">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              isReply={true} 
              parentId={comment.id}
            />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        <h3 className="text-base sm:text-lg font-semibold">
          评论 ({comments.reduce((total, comment) => 
            total + 1 + (comment.replies?.length || 0), 0
          )})
        </h3>
      </div>

      {/* 发表评论 */}
      {currentUser ? (
        <div className="space-y-3">
          <div className="flex gap-2 sm:gap-3">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="text-xs sm:text-sm">{currentUser.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Textarea
                placeholder="写下你的评论..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
              className="text-sm"
            >
              {isSubmitting ? "发表中..." : "发表评论"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>请登录后发表评论</p>
        </div>
      )}

      <Separator />

      {/* 评论列表 */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>还没有评论，来发表第一个评论吧！</p>
          </div>
        )}
      </div>
    </div>
  )
}