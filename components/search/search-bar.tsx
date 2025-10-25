"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Clock, 
  TrendingUp, 
  Hash,
  User,
  X
} from "lucide-react"

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = "搜索作品、艺术家或标签..." }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState([
    "动漫少女", "科幻场景", "概念艺术", "角色设计"
  ])
  const inputRef = useRef<HTMLInputElement>(null)

  // 热门搜索建议
  const popularSearches = [
    { type: "tag", text: "原创", icon: Hash },
    { type: "tag", text: "同人", icon: Hash },
    { type: "artist", text: "知名画师", icon: User },
    { type: "keyword", text: "机甲", icon: TrendingUp },
    { type: "keyword", text: "风景", icon: TrendingUp },
    { type: "keyword", text: "肖像", icon: TrendingUp },
  ]

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // 添加到最近搜索
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5)
      setRecentSearches(newRecentSearches)
      
      onSearch?.(searchQuery)
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const clearRecentSearch = (searchTerm: string) => {
    setRecentSearches(recentSearches.filter(s => s !== searchTerm))
  }

  const clearAllRecentSearches = () => {
    setRecentSearches([])
  }

  return (
    <div className="relative w-full max-w-2xl">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              className="pl-12 pr-20 sm:pr-24 h-12 sm:h-14 text-sm sm:text-base bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-blue-300 transition-all duration-300 placeholder:text-gray-400"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleSearch()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 sm:h-10 px-3 sm:px-5 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <span className="hidden sm:inline font-medium">搜索</span>
              <Search className="h-4 w-4 sm:hidden" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl rounded-xl" 
          align="start"
          sideOffset={8}
        >
          <Command className="rounded-xl">
            <CommandList className="max-h-80">
              {/* 最近搜索 */}
              {recentSearches.length > 0 && (
                <CommandGroup>
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80">
                    <span className="text-sm font-semibold text-gray-700">最近搜索</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                      onClick={clearAllRecentSearches}
                    >
                      清除全部
                    </Button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        setQuery(search)
                        handleSearch(search)
                      }}
                      className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{search}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-md transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          clearRecentSearch(search)
                        }}
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* 热门搜索 */}
              <CommandGroup>
                <div className="px-4 py-3 bg-gray-50/80">
                  <span className="text-sm font-semibold text-gray-700">热门搜索</span>
                </div>
                {popularSearches.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        const searchText = item.type === "tag" ? `#${item.text}` : item.text
                        setQuery(searchText)
                        handleSearch(searchText)
                      }}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{item.text}</span>
                        {item.type === "tag" && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-0 rounded-full">
                            标签
                          </Badge>
                        )}
                        {item.type === "artist" && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-0 rounded-full">
                            艺术家
                          </Badge>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>

              {/* 搜索建议 */}
              {query && (
                <CommandGroup>
                  <div className="px-2 py-1.5">
                    <span className="text-xs font-medium text-muted-foreground">搜索建议</span>
                  </div>
                  <CommandItem onSelect={() => handleSearch(`${query} 插画`)}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>{query} 插画</span>
                  </CommandItem>
                  <CommandItem onSelect={() => handleSearch(`${query} 概念艺术`)}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>{query} 概念艺术</span>
                  </CommandItem>
                  <CommandItem onSelect={() => handleSearch(`${query} 角色设计`)}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>{query} 角色设计</span>
                  </CommandItem>
                </CommandGroup>
              )}

              {query && !popularSearches.some(item => 
                item.text.toLowerCase().includes(query.toLowerCase())
              ) && (
                <CommandEmpty>
                  <div className="text-center py-6">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      按 Enter 搜索 "{query}"
                    </p>
                  </div>
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}