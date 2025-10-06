'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayout } from '@/components/providers/LayoutProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  HomeIcon,
  ClockIcon,
  HeartIcon,
  BookmarkIcon,
  UserGroupIcon,
  TagIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ClockIcon as ClockIconSolid,
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  TagIcon as TagIconSolid
} from '@heroicons/react/24/solid'
import { Flame } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
  requireAuth?: boolean
}

const mainNavItems: NavItem[] = [
  {
    name: '首页',
    href: '/',
    icon: Flame,
    activeIcon: Flame,
  },
  {
    name: '社区',
    href: '/social',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    name: '最新',
    href: '/latest',
    icon: ClockIcon,
    activeIcon: ClockIconSolid,
  },
]

const userNavItems: NavItem[] = [
  {
    name: '我的收藏',
    href: '/favorites',
    icon: BookmarkIcon,
    activeIcon: BookmarkIconSolid,
    requireAuth: true,
  },
  {
    name: '我的点赞',
    href: '/liked',
    icon: HeartIcon,
    activeIcon: HeartIconSolid,
    requireAuth: true,
  },
  {
    name: '关注列表',
    href: '/following',
    icon: UserGroupIcon,
    activeIcon: UserGroupIconSolid,
    requireAuth: true,
  },
]

const exploreNavItems: NavItem[] = [
  {
    name: '标签',
    href: '/tags',
    icon: TagIcon,
    activeIcon: TagIconSolid,
  },
]



export function Sidebar() {
  const { sidebarOpen, isMobile, toggleSidebar } = useLayout()
  const { user } = useAuth()
  const pathname = usePathname()

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href
    const Icon = isActive ? item.activeIcon : item.icon

    if (item.requireAuth && !user) {
      return null
    }

    return (
      <li className="relative group">
        <Link
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 relative overflow-hidden ${
            sidebarOpen ? '' : 'justify-center'
          } ${
            isActive
              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-lg shadow-primary/25'
              : 'hover:bg-base-200/80 text-base-content hover:shadow-md hover:bg-gradient-to-r hover:from-base-200 hover:to-base-200/50'
          }`}
        >
          <Icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
            isActive ? 'text-primary-content' : 'text-base-content group-hover:text-primary'
          }`} />
          {sidebarOpen && (
            <span className={`text-sm font-medium transition-all duration-300 ${
              isActive ? 'text-primary-content' : 'text-base-content group-hover:text-primary'
            }`}>
              {item.name}
            </span>
          )}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50"></div>
          )}
        </Link>
        
        {/* 收缩状态下的工具提示 */}
        {!sidebarOpen && !isMobile && (
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-base-300 text-base-content text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap">
            {item.name}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-base-300"></div>
          </div>
        )}
      </li>
    )
  }

  return (
    <aside 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-base-100/98 backdrop-blur-xl border-r border-base-200/50 shadow-xl transition-all duration-500 ease-in-out z-40 ${
        sidebarOpen ? 'w-72' : 'w-16'
      } ${
        isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''
      }`}
    >
      <div className={`flex flex-col h-full transition-all duration-300 ${sidebarOpen ? 'p-3' : 'p-2'}`}>
        {/* 收缩按钮 */}
        <div className={`flex ${sidebarOpen ? 'justify-end' : 'justify-center'} mb-4`}>
          <button
            onClick={toggleSidebar}
            className="p-2.5 hover:bg-base-200/70 rounded-xl transition-all duration-300 hover:scale-105 group relative ring-1 ring-transparent hover:ring-primary/20"
            title={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            {sidebarOpen ? (
              <ChevronLeftIcon className="w-5 h-5 text-base-content/80 group-hover:text-primary transition-all duration-300" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-base-content/80 group-hover:text-primary transition-all duration-300" />
            )}
            {/* 状态指示器 */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              sidebarOpen ? 'bg-primary scale-100 shadow-sm' : 'bg-base-content/20 scale-0'
            }`}></div>
          </button>
        </div>

        {/* 主要导航 */}
        <nav className="flex-1 space-y-6">
          <div>
            {sidebarOpen ? (
              <div className="px-4 py-2 mb-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                  主要
                </h3>
              </div>
            ) : (
              <div className="mb-3 flex justify-center">
                <div className="w-8 h-0.5 bg-primary/30 rounded-full"></div>
              </div>
            )}
            <ul className="space-y-2">
              {mainNavItems.map((item) => (
                <NavItemComponent key={item.href} item={item} />
              ))}
            </ul>
          </div>

          {/* 用户相关导航 */}
          {user && (
            <div>
              {sidebarOpen ? (
                <div className="px-4 py-2 mb-3">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                    个人
                  </h3>
                </div>
              ) : (
                <div className="mb-3 flex justify-center">
                  <div className="w-8 h-0.5 bg-primary/30 rounded-full"></div>
                </div>
              )}
              <ul className="space-y-2">
                {userNavItems.map((item) => (
                  <NavItemComponent key={item.href} item={item} />
                ))}
              </ul>
            </div>
          )}

          {/* 探索导航 */}
          <div>
            {sidebarOpen ? (
              <div className="px-4 py-2 mb-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                  探索
                </h3>
              </div>
            ) : (
              <div className="mb-3 flex justify-center">
                <div className="w-8 h-0.5 bg-primary/30 rounded-full"></div>
              </div>
            )}
            <ul className="space-y-2">
              {exploreNavItems.map((item) => (
                <NavItemComponent key={item.href} item={item} />
              ))}
            </ul>
          </div>


        </nav>


      </div>
    </aside>
  )
}