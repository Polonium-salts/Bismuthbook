"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ArtworkDetail } from "@/components/artwork/artwork-detail"
import { CommentSection } from "@/components/comments/comment-section"
import { Separator } from "@/components/ui/separator"
import { ImageService } from "@/lib/services/image-service"
import { useAuth } from "@/lib/providers/auth-provider"

interface ArtworkPageProps {
  params: {
    id: string
  }
}

export default function ArtworkPage({ params }: ArtworkPageProps) {
  const [artwork, setArtwork] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadArtworkData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 获取作品详情
        const artworkData = await ImageService.getImageById(params.id)
        if (!artworkData) {
          setError("作品不存在")
          return
        }
        
        setArtwork(artworkData)
        
        // 获取评论数据 (暂时设为空数组，因为评论功能还未完全实现)
        setComments([])
        
      } catch (err) {
        console.error("加载作品数据失败:", err)
        setError("加载作品数据失败")
      } finally {
        setLoading(false)
      }
    }

    loadArtworkData()
  }, [params.id])

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
      <div className="space-y-8">
        {/* 作品详情 */}
        <ArtworkDetail artwork={artwork} />
        
        <div className="max-w-7xl mx-auto px-6">
          <Separator />
          
          {/* 评论区域 */}
          <div className="py-8">
            <CommentSection 
              artworkId={params.id}
              comments={comments}
              currentUser={user}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}