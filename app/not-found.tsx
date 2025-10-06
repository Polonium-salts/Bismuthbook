'use client'

import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 图标 */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary/20 mb-4">404</div>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* 错误信息 */}
        <h1 className="text-3xl font-bold text-base-content mb-4">
          页面未找到
        </h1>
        <p className="text-base-content/70 mb-8 leading-relaxed">
          抱歉，您访问的页面不存在。可能是链接错误，或者页面已被移动或删除。
        </p>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn btn-primary">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Link>
            <Link href="/search" className="btn btn-outline">
              <Search className="w-4 h-4 mr-2" />
              搜索作品
            </Link>
          </div>
          
          <button 
            onClick={() => window.history.back()} 
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </button>
        </div>

        {/* 建议链接 */}
        <div className="mt-12 pt-8 border-t border-base-200">
          <h2 className="text-lg font-semibold mb-4">您可能想要：</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Link 
              href="/" 
              className="p-3 bg-base-100 rounded-lg hover:bg-base-200 transition-colors text-left"
            >
              <div className="font-medium">浏览最新作品</div>
              <div className="text-base-content/60">发现精彩插画</div>
            </Link>
            <Link 
              href="/upload" 
              className="p-3 bg-base-100 rounded-lg hover:bg-base-200 transition-colors text-left"
            >
              <div className="font-medium">上传作品</div>
              <div className="text-base-content/60">分享你的创作</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}