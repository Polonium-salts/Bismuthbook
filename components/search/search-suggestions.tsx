"use client"

import { useState, useEffect } from "react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Hash, User, Clock } from "lucide-react"

interface Suggestion {
  type: 'keyword' | 'tag' | 'artist' | 'recent'
  text: string
  count?: number
}

interface SearchSuggestionsProps {
  query: string
  onSelect: (text: string) => void
  recentSearches?: string[]
}

export function SearchSuggestions({ 
  query, 
  onSelect,
  recentSearches = []
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    
    // 模拟 API 调用获取建议
    const timer = setTimeout(() => {
      const mockSuggestions: Suggestion[] = [
        { type: 'keyword', text: `${query} 插画`, count: 1234 },
        { type: 'keyword', text: `${query} 概念艺术`, count: 856 },
        { type: 'tag', text: query, count: 2341 },
        { type: 'artist', text: `${query}画师`, count: 45 },
      ]
      setSuggestions(mockSuggestions)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const getIcon = (type: string) => {
    switch (type) {
      case 'tag': return Hash
      case 'artist': return User
      case 'recent': return Clock
      default: return Search
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tag': return '标签'
      case 'artist': return '艺术家'
      case 'recent': return '最近'
      default: return ''
    }
  }

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandList>
        {/* 最近搜索 */}
        {recentSearches.length > 0 && !query && (
          <CommandGroup heading="最近搜索">
            {recentSearches.slice(0, 5).map((search, index) => (
              <CommandItem
                key={index}
                onSelect={() => onSelect(search)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{search}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* 搜索建议 */}
        {query && suggestions.length > 0 && (
          <CommandGroup heading="搜索建议">
            {suggestions.map((suggestion, index) => {
              const Icon = getIcon(suggestion.type)
              const typeLabel = getTypeLabel(suggestion.type)
              
              return (
                <CommandItem
                  key={index}
                  onSelect={() => onSelect(suggestion.text)}
                  className="flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span>{suggestion.text}</span>
                    {typeLabel && (
                      <Badge variant="secondary" className="text-xs">
                        {typeLabel}
                      </Badge>
                    )}
                  </div>
                  {suggestion.count && (
                    <span className="text-xs text-gray-500">
                      {suggestion.count.toLocaleString()} 个结果
                    </span>
                  )}
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {/* 热门搜索 */}
        {!query && (
          <CommandGroup heading="热门搜索">
            <CommandItem onSelect={() => onSelect('动漫少女')} className="cursor-pointer">
              <TrendingUp className="mr-2 h-4 w-4 text-orange-500" />
              <span>动漫少女</span>
              <Badge variant="secondary" className="ml-auto text-xs">热门</Badge>
            </CommandItem>
            <CommandItem onSelect={() => onSelect('科幻场景')} className="cursor-pointer">
              <TrendingUp className="mr-2 h-4 w-4 text-orange-500" />
              <span>科幻场景</span>
              <Badge variant="secondary" className="ml-auto text-xs">热门</Badge>
            </CommandItem>
            <CommandItem onSelect={() => onSelect('概念艺术')} className="cursor-pointer">
              <TrendingUp className="mr-2 h-4 w-4 text-orange-500" />
              <span>概念艺术</span>
              <Badge variant="secondary" className="ml-auto text-xs">热门</Badge>
            </CommandItem>
          </CommandGroup>
        )}

        {isLoading && (
          <CommandEmpty>
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </CommandEmpty>
        )}

        {query && !isLoading && suggestions.length === 0 && (
          <CommandEmpty>
            <div className="text-center py-6">
              <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                按 Enter 搜索 &quot;{query}&quot;
              </p>
            </div>
          </CommandEmpty>
        )}
      </CommandList>
    </Command>
  )
}
