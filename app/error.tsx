'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('应用程序错误:', error)
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        {/* 错误图标 */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-error" />
          </div>
          <div className="w-24 h-1 bg-error mx-auto rounded-full"></div>
        </div>

        {/* 错误信息 */}
        <h1 className="text-3xl font-bold text-base-content mb-4">
          出现了一些问题
        </h1>
        <p className="text-base-content/70 mb-8 leading-relaxed">
          抱歉，应用程序遇到了意外错误。我们已经记录了这个问题，请稍后重试。
        </p>

        {/* 开发环境下显示错误详情 */}
        {isDevelopment && (
          <div className="mb-8 p-4 bg-error/5 border border-error/20 rounded-lg text-left">
            <h3 className="font-semibold text-error mb-2 flex items-center">
              <Bug className="w-4 h-4 mr-2" />
              错误详情 (仅开发环境显示)
            </h3>
            <pre className="text-xs text-base-content/70 overflow-auto">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-base-content/50 mt-2">
                错误ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={reset}
              className="btn btn-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </button>
            <Link href="/" className="btn btn-outline">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </div>
        </div>

        {/* 帮助信息 */}
        <div className="mt-12 pt-8 border-t border-base-200">
          <h2 className="text-lg font-semibold mb-4">需要帮助？</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <button 
              onClick={() => window.location.reload()}
              className="p-3 bg-base-100 rounded-lg hover:bg-base-200 transition-colors text-left"
            >
              <div className="font-medium">刷新页面</div>
              <div className="text-base-content/60">重新加载应用</div>
            </button>
            <button 
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                window.location.reload()
              }}
              className="p-3 bg-base-100 rounded-lg hover:bg-base-200 transition-colors text-left"
            >
              <div className="font-medium">清除缓存</div>
              <div className="text-base-content/60">清除本地数据</div>
            </button>
          </div>
          
          <p className="text-xs text-base-content/50 mt-6">
            如果问题持续存在，请联系技术支持。
          </p>
        </div>
      </div>
    </div>
  )
}