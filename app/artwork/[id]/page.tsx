"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ArtworkDetail } from "@/components/artwork/artwork-detail"
import { CommentSection } from "@/components/comments/comment-section"
import { Separator } from "@/components/ui/separator"

// 示例数据 - 在实际应用中这些数据会从API获取
const sampleArtwork = {
  id: "1",
  title: "夕阳下的城市风景",
  imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
  description: "这是一幅描绘城市夕阳美景的数字绘画作品。通过温暖的色调和细腻的光影处理，展现了都市生活中难得的宁静时刻。作品运用了现代数字绘画技法，结合传统构图理念，营造出既现代又富有诗意的视觉效果。",
  artist: {
    name: "艺术家小明",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    bio: "专注于城市风景和概念艺术的数字画家，擅长用色彩表达情感。",
    followers: 15420
  },
  likes: 1234,
  views: 5678,
  comments: 89,
  tags: ["风景", "城市", "夕阳", "数字绘画", "概念艺术"],
  isLiked: false,
  isBookmarked: true,
  createdAt: "2024年1月15日",
  dimensions: "3840 × 2160 px",
  software: ["Photoshop", "Procreate"],
  category: "数字绘画"
}

const sampleComments = [
  {
    id: "1",
    user: {
      name: "艺术爱好者",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      isVerified: true
    },
    content: "太美了！这种光影效果真的很棒，特别是夕阳的渐变色彩处理得非常自然。请问用的是什么笔刷？",
    likes: 23,
    isLiked: false,
    createdAt: "2小时前",
    replies: [
      {
        id: "1-1",
        user: {
          name: "艺术家小明",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
          isArtist: true
        },
        content: "谢谢！主要用的是软圆笔刷，配合一些纹理笔刷来增加细节。",
        likes: 12,
        isLiked: true,
        createdAt: "1小时前"
      }
    ]
  },
  {
    id: "2",
    user: {
      name: "设计师小李",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    content: "构图很棒！这种透视角度很有电影感，让人想起宫崎骏的作品风格。",
    likes: 18,
    isLiked: true,
    createdAt: "3小时前",
    replies: []
  },
  {
    id: "3",
    user: {
      name: "新手画家",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    content: "作为初学者，想请教一下这种氛围感是怎么营造的？色彩搭配有什么技巧吗？",
    likes: 5,
    isLiked: false,
    createdAt: "5小时前",
    replies: [
      {
        id: "3-1",
        user: {
          name: "艺术家小明",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
          isArtist: true
        },
        content: "氛围感主要靠色温对比，暖色的夕阳和冷色的阴影形成对比。建议多观察真实的光影变化。",
        likes: 8,
        isLiked: false,
        createdAt: "4小时前"
      },
      {
        id: "3-2",
        user: {
          name: "色彩大师",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          isVerified: true
        },
        content: "补充一点，可以尝试用互补色来增强对比度，比如橙色和蓝色的搭配。",
        likes: 15,
        isLiked: true,
        createdAt: "3小时前"
      }
    ]
  }
]

const currentUser = {
  name: "当前用户",
  avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face"
}

interface ArtworkPageProps {
  params: {
    id: string
  }
}

export default function ArtworkPage({ params }: ArtworkPageProps) {
  // 在实际应用中，这里会根据params.id从API获取作品数据
  
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* 作品详情 */}
        <ArtworkDetail artwork={sampleArtwork} />
        
        <div className="max-w-7xl mx-auto px-6">
          <Separator />
          
          {/* 评论区域 */}
          <div className="py-8">
            <CommentSection 
              artworkId={params.id}
              comments={sampleComments}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}