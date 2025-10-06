'use client'

import { useState } from 'react'
import { PostComposer } from '@/components/home/PostComposer'
import { PostFeed } from '@/components/home/PostFeed'
import { CommunityPanel } from '@/components/community/CommunityPanel'

export default function SocialPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleNewPost = () => {
    // 触发动态流刷新
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-base-50 dark:bg-base-900">
      {/* 两栏布局容器 */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex gap-6">
          {/* 主要内容区域 */}
          <div className="flex-1 max-w-4xl">
            {/* 发布动态组件 */}
            <div className="sticky top-0 z-20 bg-base-100/95 backdrop-blur-sm border-b border-base-200/50">
              <PostComposer onPostSuccess={handleNewPost} />
            </div>
            
            {/* 动态流 */}
            <PostFeed refreshTrigger={refreshTrigger} />
          </div>

          {/* 右侧社区面板 */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <CommunityPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}