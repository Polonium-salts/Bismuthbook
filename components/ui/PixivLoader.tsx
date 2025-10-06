'use client'

import { useEffect, useState } from 'react'

interface PixivLoaderProps {
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function PixivLoader({ loading = true, size = 'md', text = '加载中...' }: PixivLoaderProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!loading) return

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [loading])

  if (!loading) return null

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Pixiv风格的加载动画 */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-gray-200 dark:border-gray-700 rounded-full animate-spin`}>
          <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent border-r-pink-500 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      
      {/* 加载文本 */}
      <div className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium`}>
        {text}{dots}
      </div>
    </div>
  )
}

// 全屏加载组件
export function PixivFullScreenLoader({ loading = true, text = '正在加载精彩内容...' }: { loading?: boolean, text?: string }) {
  if (!loading) return null

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
        <PixivLoader loading={loading} size="lg" text={text} />
      </div>
    </div>
  )
}

// 页面过渡动画组件
export function PixivPageTransition({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div 
      className={`transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  )
}