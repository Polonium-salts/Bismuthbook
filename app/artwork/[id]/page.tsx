"use client"

import { useState, useEffect, use } from "react"
import { MainLayout } from "@/components/layout/main-layout"
const ArtworkDetail = dynamic(() => import("@/components/artwork/artwork-detail").then(mod => ({ default: mod.ArtworkDetail })), {
  loading: () => <div className="flex items-center justify-center p-8">加载作品详情中...</div>
})
import dynamic from "next/dynamic"

const CommentSection = dynamic(() => import("@/components/comments/comment-section").then(mod => ({ default: mod.CommentSection })), {
  loading: () => <div className="flex items-center justify-center p-8">加载评论中...</div>
})
import { Separator } from "@/components/ui/separator"
import { imageService } from "@/lib/services/image-service"
import { useAuth } from "@/lib/providers/auth-provider"
import { useInteractions, useComments } from "@/lib/hooks/use-interactions"
import { getImageUrl } from "@/lib/supabase"

interface ArtworkPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ArtworkPage({ params }: ArtworkPageProps) {
  const resolvedParams = use(params)
  const [artwork, setArtwork] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()
  
  // 使用交互功能 hooks
  const { 
    viewCount, 
    commentCount, 
    likeCount, 
    isLiked, 
    isFavorited, 
    toggleLike, 
    toggleFavorite, 
    loadStats 
  } = useInteractions(resolvedParams.id)
  
  const { 
    comments, 
    isLoading: isLoadingComments, 
    isSubmitting: isSubmittingComment, 
    addComment, 
    updateComment, 
    deleteComment, 
    loadComments 
  } = useComments(resolvedParams.id)

  useEffect(() => {
    const loadArtworkData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 获取作品详情
        const artworkData = await imageService.getImageById(resolvedParams.id)
        if (!artworkData) {
          setError("作品不存在")
          return
        }
        
        setArtwork(artworkData)
        
        // 加载交互统计数据
        loadStats()
        
        // 加载评论数据
        loadComments()
        
      } catch (err) {
        console.error("加载作品数据失败:", err)
        setError("加载作品数据失败")
      } finally {
        setLoading(false)
      }
    }

    loadArtworkData()
  }, [resolvedParams.id, loadStats, loadComments])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !artwork) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "作品不存在"}</p>
            <button 
              onClick={() => window.history.back()}
              className="text-primary hover:underline"
            >
              返回上一页
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* 作品详情区域 */}
        <div className="w-full">
          <ArtworkDetail 
            artwork={{
              ...artwork,
              imageUrl: getImageUrl(artwork.image_url),
              artist: {
                name: artwork.user_profiles.username || artwork.user_profiles.full_name || 'Unknown Artist',
                username: artwork.user_profiles.username,
                avatar: artwork.user_profiles.avatar_url || '',
                bio: artwork.user_profiles.bio || undefined,
                followers: undefined
              },
              likes: likeCount,
              views: viewCount,
              comments: commentCount,
              isLiked,
              isBookmarked: isFavorited
            }}
            onLike={toggleLike}
            onBookmark={toggleFavorite}
          />
        </div>
        
        {/* 评论区域 */}
        <div className="w-full bg-card/50 border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6 sm:py-8 lg:py-12">
              <CommentSection 
                artworkId={resolvedParams.id}
                comments={comments}
                currentUser={user && profile ? {
                  name: profile.username || profile.full_name || 'Anonymous',
                  avatar: profile.avatar_url || ''
                } : undefined}
                isLoading={isLoadingComments}
                isSubmitting={isSubmittingComment}
                onAddComment={addComment}
                onUpdateComment={updateComment}
                onDeleteComment={deleteComment}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}