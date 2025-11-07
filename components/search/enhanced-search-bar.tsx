"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchSuggestions } from "./search-suggestions"
import { useSearchHistory } from "@/hooks/use-search-history"
import { useDebounce } from "@/hooks/use-debounce"
import { Search, X, Loader2 } from "lucide-react"

interface EnhancedSearchBarProps {
  defaultValue?: string
  placeholder?: string
  onSearch?: (query: string) => void
  showSuggestions?: boolean
  autoFocus?: boolean
}

export function EnhancedSearchBar({ 
  defaultValue = "",
  placeholder = "搜索作品、艺术家或标签...",
  onSearch,
  showSuggestions = true,
  autoFocus = false
}: EnhancedSearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { history, addToHistory } = useSearchHistory()
  const debouncedQuery = useDebounce(query, 300)

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSearch = useCallback(async (searchQuery: string = query) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    setIsSearching(true)
    
    // 添加到历史记录
    addToHistory(trimmedQuery)
    
    // 关闭建议框
    setIsOpen(false)
    
    if (onSearch) {
      onSearch(trimmedQuery)
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
    
    // 模拟搜索延迟
    setTimeout(() => {
      setIsSearching(false)
    }, 500)
  }, [query, onSearch, router, addToHistory])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }, [handleSearch])

  const handleClear = useCallback(() => {
    setQuery("")
    inputRef.current?.focus()
  }, [])

  const handleSuggestionSelect = useCallback((text: string) => {
    setQuery(text)
    handleSearch(text)
  }, [handleSearch])

  return (
    <div className="relative w-full max-w-2xl">
      <Popover open={isOpen && showSuggestions} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative group">
            {/* 搜索图标 */}
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300 pointer-events-none z-10" />
            
            {/* 输入框 */}
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              disabled={isSearching}
              className="pl-12 pr-24 h-12 sm:h-14 text-sm sm:text-base bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-blue-300 transition-all duration-300 placeholder:text-gray-400"
            />

            {/* 清除按钮 */}
            {query && !isSearching && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="absolute right-16 sm:right-20 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            )}

            {/* 加载指示器 */}
            {isSearching && (
              <div className="absolute right-16 sm:right-20 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              </div>
            )}

            {/* 搜索按钮 */}
            <Button
              type="button"
              size="sm"
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 sm:h-10 px-3 sm:px-5 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
            >
              <span className="hidden sm:inline font-medium">搜索</span>
              <Search className="h-4 w-4 sm:hidden" />
            </Button>
          </div>
        </PopoverTrigger>
        
        {/* 搜索建议 */}
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl rounded-xl" 
          align="start"
          sideOffset={8}
        >
          <SearchSuggestions
            query={debouncedQuery}
            onSelect={handleSuggestionSelect}
            recentSearches={history}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
