# 搜索功能使用示例

## 1. 基本搜索页面

```tsx
import { YouTubeSearchFilters } from "@/components/search/youtube-search-filters"
import { YouTubeSearchResults } from "@/components/search/youtube-search-results"

export default function SearchPage() {
  const [sortBy, setSortBy] = useState('created_at')
  const [results, setResults] = useState([])

  return (
    <div>
      <YouTubeSearchFilters
        sortBy={sortBy}
        onSortChange={setSortBy}
        // ... 其他 props
      />
      
      <YouTubeSearchResults
        results={results}
        // ... 其他 props
      />
    </div>
  )
}
```

## 2. 在导航栏中使用搜索

```tsx
import { YouTubeStyleSearchBar } from "@/components/search/youtube-style-search-bar"

export function Header() {
  return (
    <header>
      <YouTubeStyleSearchBar 
        placeholder="搜索作品..."
      />
    </header>
  )
}
```

## 3. 带建议的搜索栏

```tsx
import { SearchBar } from "@/components/search/search-bar"

export function HomePage() {
  const handleSearch = (query: string) => {
    console.log('搜索:', query)
  }

  return (
    <SearchBar 
      onSearch={handleSearch}
      placeholder="搜索作品、艺术家或标签..."
    />
  )
}
```

## 4. 完整的搜索流程

```tsx
"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  
  // 1. 处理搜索
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery)
    router.push(`/search?q=${encodeURIComponent(newQuery)}`)
  }, [router])
  
  // 2. 处理筛选
  const handleFilterChange = useCallback((filters) => {
    // 更新筛选器状态
  }, [])
  
  // 3. 加载更多
  const handleLoadMore = useCallback(() => {
    // 加载更多结果
  }, [])
  
  return (
    <div>
      {/* 搜索栏 */}
      <SearchBar onSearch={handleSearch} />
      
      {/* 筛选器 */}
      <YouTubeSearchFilters
        onSortChange={handleFilterChange}
        // ...
      />
      
      {/* 结果 */}
      <YouTubeSearchResults
        results={results}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  )
}
```

## 5. 自定义搜索结果卡片

```tsx
// 列表视图
<div className="flex gap-4">
  <Image src={artwork.image_url} width={240} height={144} />
  <div>
    <h3>{artwork.title}</h3>
    <p>{artwork.description}</p>
  </div>
</div>

// 网格视图
<div className="grid grid-cols-4 gap-4">
  {artworks.map(artwork => (
    <div key={artwork.id}>
      <Image src={artwork.image_url} />
      <h3>{artwork.title}</h3>
    </div>
  ))}
</div>
```

## 6. 搜索状态管理

```tsx
// 使用 React Query
import { useQuery } from '@tanstack/react-query'

function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchSearchResults(query),
    enabled: !!query
  })
}

// 使用 SWR
import useSWR from 'swr'

function useSearch(query: string) {
  return useSWR(
    query ? `/api/search?q=${query}` : null,
    fetcher
  )
}
```

## 7. 搜索历史

```tsx
// 保存搜索历史
const saveSearchHistory = (query: string) => {
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
  const newHistory = [query, ...history.filter(q => q !== query)].slice(0, 10)
  localStorage.setItem('searchHistory', JSON.stringify(newHistory))
}

// 获取搜索历史
const getSearchHistory = () => {
  return JSON.parse(localStorage.getItem('searchHistory') || '[]')
}
```

## 8. 搜索建议

```tsx
const [suggestions, setSuggestions] = useState([])

const fetchSuggestions = async (query: string) => {
  const response = await fetch(`/api/suggestions?q=${query}`)
  const data = await response.json()
  setSuggestions(data)
}

// 防抖
import { debounce } from 'lodash'

const debouncedFetch = debounce(fetchSuggestions, 300)

useEffect(() => {
  if (query.length > 2) {
    debouncedFetch(query)
  }
}, [query])
```

## 9. URL 参数同步

```tsx
// 读取 URL 参数
const searchParams = useSearchParams()
const query = searchParams.get('q')
const sortBy = searchParams.get('sort')
const category = searchParams.get('category')

// 更新 URL 参数
const updateURL = (params: Record<string, string>) => {
  const newParams = new URLSearchParams(searchParams)
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
  })
  router.push(`/search?${newParams.toString()}`)
}
```

## 10. 响应式设计

```tsx
// 移动端使用 Sheet，桌面端使用 Dropdown
import { useMediaQuery } from '@/hooks/use-media-query'

function SearchFilters() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger>筛选</SheetTrigger>
        <SheetContent>
          {/* 筛选器内容 */}
        </SheetContent>
      </Sheet>
    )
  }
  
  return (
    <DropdownMenu>
      {/* 筛选器内容 */}
    </DropdownMenu>
  )
}
```
