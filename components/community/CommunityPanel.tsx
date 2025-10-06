'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  StarIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Community {
  id: string
  name: string
  description: string
  memberCount: number
  isOfficial: boolean
  isJoined: boolean
  avatar?: string
}

export function CommunityPanel() {
  const [communities] = useState<Community[]>([
    {
      id: 'official',
      name: '官方社区',
      description: '欢迎来到Bismuth Book官方社区！在这里分享你的创作，与其他艺术家交流。',
      memberCount: 12580,
      isOfficial: true,
      isJoined: true,
    }
  ])

  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(
    new Set(['official'])
  )

  const handleJoinCommunity = (communityId: string) => {
    setJoinedCommunities(prev => {
      const newSet = new Set(prev)
      if (newSet.has(communityId)) {
        newSet.delete(communityId)
      } else {
        newSet.add(communityId)
      }
      return newSet
    })
  }

  const formatMemberCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`
    }
    return count.toLocaleString()
  }

  return (
    <div className="bg-base-100 rounded-2xl border border-base-200/50 overflow-hidden">
      {/* 标题栏 */}
      <div className="p-4 border-b border-base-200/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-primary" />
            社区
          </h3>
          <button className="p-1 hover:bg-base-200/70 rounded-full transition-colors duration-200">
            <PlusIcon className="w-4 h-4 text-base-content/60" />
          </button>
        </div>
      </div>

      {/* 社区列表 */}
      <div className="divide-y divide-base-200/30">
        {communities.map((community) => {
          const isJoined = joinedCommunities.has(community.id)
          
          return (
            <div key={community.id} className="p-4 hover:bg-base-50/50 transition-colors duration-200">
              <div className="flex items-start gap-3">
                {/* 社区头像 */}
                <div className="flex-shrink-0">
                  {community.avatar ? (
                    <img 
                      src={community.avatar} 
                      alt={community.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      community.isOfficial 
                        ? 'bg-gradient-to-br from-primary to-secondary' 
                        : 'bg-gradient-to-br from-accent to-info'
                    }`}>
                      <UserGroupIcon className="w-6 h-6 text-primary-content" />
                    </div>
                  )}
                </div>

                {/* 社区信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-base-content truncate">
                      {community.name}
                    </h4>
                    {community.isOfficial && (
                      <StarIconSolid className="w-4 h-4 text-warning flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm text-base-content/70 line-clamp-2 mb-2">
                    {community.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-base-content/60">
                      {formatMemberCount(community.memberCount)} 成员
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleJoinCommunity(community.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          isJoined
                            ? 'bg-primary text-primary-content hover:bg-primary/90'
                            : 'bg-base-200 text-base-content hover:bg-base-300'
                        }`}
                      >
                        {isJoined ? '已加入' : '加入'}
                      </button>
                      
                      <Link 
                        href={`/community/${community.id}`}
                        className="p-1 hover:bg-base-200/70 rounded-full transition-colors duration-200"
                      >
                        <ChevronRightIcon className="w-4 h-4 text-base-content/60" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 底部链接 */}
      <div className="p-4 border-t border-base-200/50">
        <Link 
          href="/communities"
          className="block text-center text-sm text-primary hover:text-primary/80 transition-colors duration-200"
        >
          查看更多社区
        </Link>
      </div>
    </div>
  )
}