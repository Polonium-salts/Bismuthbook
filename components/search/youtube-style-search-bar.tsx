"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Mic } from "lucide-react"

interface YouTubeStyleSearchBarProps {
  defaultValue?: string
  placeholder?: string
  onSearch?: (query: string) => void
}

export function YouTubeStyleSearchBar({ 
  defaultValue = "",
  placeholder = "搜索",
  onSearch 
}: YouTubeStyleSearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }, [query, onSearch, router])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }, [handleSearch])

  const handleClear = useCallback(() => {
    setQuery("")
    inputRef.current?.focus()
  }, [])

  return (
    <div className="flex items-center gap-2 max-w-2xl w-full">
      {/* 搜索输入框 - YouTube 风格 */}
      <div 
        className={`flex items-center flex-1 border rounded-full overflow-hidden transition-all ${
          isFocused 
            ? 'border-blue-500 shadow-md' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-4 rounded-l-full"
        />
        
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-10 w-10 rounded-none hover:bg-transparent"
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        )}

        <Button
          type="button"
          onClick={handleSearch}
          className="h-10 px-6 rounded-none rounded-r-full bg-gray-50 hover:bg-gray-100 text-gray-700 border-l border-gray-300"
          variant="ghost"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* 语音搜索按钮 */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full hover:bg-gray-100"
        title="语音搜索"
      >
        <Mic className="h-5 w-5" />
      </Button>
    </div>
  )
}
