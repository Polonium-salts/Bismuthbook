'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLayout } from '@/components/providers/LayoutProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export function Navbar() {
  const router = useRouter()
  const { isMobile } = useLayout()
  const { user, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowMobileSearch(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="navbar fixed top-0 left-0 right-0 h-16 bg-base-100/98 backdrop-blur-2xl border-b border-base-300/30 z-50 shadow-sm">
      <div className="flex items-center h-full px-4 lg:px-6 max-w-screen-2xl mx-auto w-full">
        {/* 左侧 - 品牌区域 - 固定宽度确保始终在最左侧 */}
        <div className="flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-all duration-300 group flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-secondary rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 ring-1 ring-white/20 flex-shrink-0">
              <span className="text-primary-content font-bold text-xl">B</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block whitespace-nowrap">
                Bismuthbook
              </span>
              <span className="text-xs text-base-content/60 font-medium hidden lg:block whitespace-nowrap">
                创意艺术社区
              </span>
            </div>
          </Link>
        </div>

        {/* 中间搜索框 - 桌面端 */}
        {!isMobile && (
          <div className="flex-1 max-w-xl mx-6 lg:mx-8 min-w-0">
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索作品、用户或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-base-200/60 border border-base-300/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-base-content placeholder:text-base-content/60 transition-all duration-300 hover:bg-base-200/80 focus:bg-base-100 hover:border-base-300/60 focus:shadow-lg backdrop-blur-sm text-sm"
                />
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-300 group-focus-within:text-primary/70 transition-colors duration-300" />
                
                {/* 搜索建议指示器 */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                  <kbd className="kbd kbd-xs bg-base-300/50 text-slate-600 dark:text-slate-300 border-base-300/60">⏎</kbd>
                </div>
              </div>
              
              {/* 搜索框底部装饰线 */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 group-focus-within:w-full"></div>
            </form>
          </div>
        )}

        {/* 右侧功能区域 */}
        <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0 ml-auto">
          {/* 移动端搜索按钮 */}
          {isMobile && (
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2.5 hover:bg-base-200/70 rounded-xl transition-all duration-300 hover:scale-105 ring-1 ring-transparent hover:ring-primary/20"
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors" />
            </button>
          )}

          {user ? (
            <>
              {/* 发布作品按钮 */}
              <Link 
                href="/create" 
                className="btn btn-primary btn-sm px-3 lg:px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-content flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="hidden sm:inline">发布作品</span>
              </Link>
              
              {/* 分隔线 */}
              <div className="w-px h-6 bg-base-300/50 hidden lg:block"></div>
              
              <ThemeToggle />
              
              <button className="p-2.5 hover:bg-base-200/70 rounded-xl transition-all duration-300 hover:scale-105 relative group ring-1 ring-transparent hover:ring-primary/20">
                <BellIcon className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-error to-warning rounded-full shadow-sm animate-pulse ring-2 ring-base-100"></span>
              </button>

              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar hover:bg-base-200/70 transition-all duration-300 hover:scale-105 ring-1 ring-transparent hover:ring-primary/20">
                  {user.avatar_url ? (
                    <div className="w-9 h-9 rounded-full ring-2 ring-primary/30 hover:ring-primary/50 transition-all duration-300 shadow-sm">
                      <img src={user.avatar_url} alt={user.username} className="rounded-full object-cover" />
                    </div>
                  ) : (
                    <UserCircleIcon className="w-9 h-9 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors" />
                  )}
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-4 z-[1] p-2 shadow-2xl bg-base-100/95 backdrop-blur-xl rounded-2xl w-60 border border-base-200/50 ring-1 ring-black/5">
                  <li>
                    <Link href={`/user/${user.username}`} className="justify-between py-3 px-4 rounded-xl hover:bg-primary/8 transition-all duration-300 group">
                      <span className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-primary">个人主页</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                  </li>

                  <div className="divider my-2 opacity-50"></div>
                  <li>
                    <button onClick={handleSignOut} className="py-3 px-4 rounded-xl hover:bg-error/8 text-slate-800 dark:text-slate-100 hover:text-error transition-all duration-300 group">
                      <ArrowRightOnRectangleIcon className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-error transition-colors" />
                      <span className="font-medium">退出登录</span>
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* 分隔线 */}
              <div className="w-px h-6 bg-base-300/50 hidden lg:block"></div>
              
              <ThemeToggle />
              
              <Link href="/login" className="btn btn-ghost btn-sm px-3 lg:px-4 py-2 rounded-xl hover:bg-base-200/70 transition-all duration-300 hover:scale-105 font-medium text-slate-700 dark:text-slate-200 hover:text-primary ring-1 ring-transparent hover:ring-primary/20">
                登录
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm px-3 lg:px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-content">
                注册
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 移动端搜索框 */}
      {isMobile && showMobileSearch && (
        <div className="absolute top-16 left-0 right-0 bg-base-100/98 backdrop-blur-xl border-b border-base-200/50 p-4 shadow-lg">
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索作品、用户或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-base-200/60 border border-base-300/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-base-content placeholder:text-base-content/60 transition-all duration-300 focus:bg-base-100 focus:shadow-lg"
                autoFocus
              />
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-slate-300 group-focus-within:text-primary/70 transition-colors duration-300" />
              
              {/* 关闭按钮 */}
              <button
                type="button"
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-base-300/50 rounded-lg transition-colors duration-200"
              >
                <span className="text-slate-600 dark:text-slate-300 text-sm">✕</span>
              </button>
            </div>
            
            {/* 搜索框底部装饰线 */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 group-focus-within:w-full"></div>
          </form>
        </div>
      )}
    </nav>
  )
}