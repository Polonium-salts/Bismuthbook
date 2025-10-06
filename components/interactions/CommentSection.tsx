'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Send, Heart, MoreHorizontal, Trash2, Edit3 } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  post_id: string
  users: {
    username: string
    avatar_url?: string
  }
  likes_count?: number
  is_liked?: boolean
}

interface CommentSectionProps {
  postId: string
  className?: string
}

export default function CommentSection({ postId, className = '' }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setComments(data || [])
    } catch (err) {
      console.error('获取评论失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim() || submitting) return

    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          post_id: postId
        })
        .select(`
          *,
          users (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setComments(prev => [data, ...prev])
      setNewComment('')
    } catch (err) {
      console.error('发布评论失败:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId)

      if (error) throw error

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, content: editContent.trim() }
            : comment
        )
      )
      setEditingId(null)
      setEditContent('')
    } catch (err) {
      console.error('编辑评论失败:', err)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (err) {
      console.error('删除评论失败:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '刚刚'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-base-200 rounded w-24 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-base-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-base-200 rounded w-20"></div>
                  <div className="h-4 bg-base-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-lg font-semibold">
        评论 ({comments.length})
      </h3>

      {/* 发布评论 */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex gap-3">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full">
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="头像"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center text-sm">
                    {user.user_metadata?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                className="textarea textarea-bordered w-full resize-none"
                rows={3}
                placeholder="写下你的评论..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className={`btn btn-primary btn-sm ${submitting ? 'loading' : ''}`}
                  disabled={!newComment.trim() || submitting}
                >
                  {!submitting && <Send className="w-4 h-4 mr-1" />}
                  发布
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 bg-base-100 rounded-lg border border-base-200">
          <p className="text-base-content/70 mb-4">登录后可以发表评论</p>
          <Link href="/login" className="btn btn-primary btn-sm">
            立即登录
          </Link>
        </div>
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-base-content/70">
            还没有评论，来发表第一条评论吧！
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Link href={`/user/${comment.users.username}`} className="avatar">
                <div className="w-8 h-8 rounded-full">
                  {comment.users.avatar_url ? (
                    <Image
                      src={comment.users.avatar_url}
                      alt={comment.users.username}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center text-sm">
                      {comment.users.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/user/${comment.users.username}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {comment.users.username}
                  </Link>
                  <span className="text-xs text-base-content/50">
                    {formatDate(comment.created_at)}
                  </span>
                </div>

                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="textarea textarea-bordered w-full resize-none text-sm"
                      rows={2}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => handleEditComment(comment.id)}
                        disabled={!editContent.trim()}
                      >
                        保存
                      </button>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setEditingId(null)
                          setEditContent('')
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-base-content/90 mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost btn-xs text-base-content/50 hover:text-red-500">
                        <Heart className="w-3 h-3" />
                        <span className="ml-1">0</span>
                      </button>
                      
                      {user?.id === comment.user_id && (
                        <div className="dropdown dropdown-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="btn btn-ghost btn-xs">
                            <MoreHorizontal className="w-3 h-3" />
                          </button>
                          <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                            <li>
                              <button
                                onClick={() => {
                                  setEditingId(comment.id)
                                  setEditContent(comment.content)
                                }}
                                className="text-xs"
                              >
                                <Edit3 className="w-3 h-3" />
                                编辑
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-xs text-error"
                              >
                                <Trash2 className="w-3 h-3" />
                                删除
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}