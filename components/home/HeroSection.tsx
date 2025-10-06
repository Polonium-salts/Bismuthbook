'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Sparkles, Palette, Users } from 'lucide-react'

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="hero min-h-[60vh] md:min-h-[70vh] bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-lg"></div>
      
      <div className="hero-content text-center px-4 relative z-10">
        <div className="max-w-4xl">
          {/* 主标题 */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Bismuthbook
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-lg md:text-xl font-medium text-slate-700 dark:text-slate-200">
                创意无界，艺术无限
              </span>
              <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
            </div>
          </div>

          {/* 描述文字 */}
          <p className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            发现、分享和收藏精美的插画作品。
            <br className="hidden md:block" />
            加入我们的创作者社区，展示你的艺术才华，与全球艺术家交流创作心得。
          </p>

          {/* 特色功能 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-base-100/50 backdrop-blur-sm border border-base-200/50 hover:shadow-lg transition-all duration-300">
              <Palette className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">精美作品</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 text-center">发现来自全球艺术家的精美插画</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-base-100/50 backdrop-blur-sm border border-base-200/50 hover:shadow-lg transition-all duration-300">
              <Users className="w-8 h-8 text-secondary mb-2" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">创作社区</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 text-center">与志同道合的创作者交流互动</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-base-100/50 backdrop-blur-sm border border-base-200/50 hover:shadow-lg transition-all duration-300">
              <Sparkles className="w-8 h-8 text-accent mb-2" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">灵感启发</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 text-center">获取无限创作灵感和技巧分享</p>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link 
                  href="/upload" 
                  className="btn btn-primary btn-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  上传作品
                </Link>
                <Link 
                  href="/search" 
                  className="btn btn-outline btn-lg px-8 hover:shadow-lg transition-all duration-300"
                >
                  探索作品
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/register" 
                  className="btn btn-primary btn-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Users className="w-5 h-5 mr-2" />
                  加入社区
                </Link>
                <Link 
                  href="/search" 
                  className="btn btn-outline btn-lg px-8 hover:shadow-lg transition-all duration-300"
                >
                  探索作品
                </Link>
              </>
            )}
          </div>

          {/* 统计信息 */}
          <div className="mt-12 pt-8 border-t border-base-200/50">
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">精美作品</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-secondary">500+</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">活跃创作者</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-accent">50+</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">艺术分类</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}