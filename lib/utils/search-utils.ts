/**
 * 搜索相关的工具函数
 */

/**
 * 高亮搜索关键词
 * @param text 原始文本
 * @param query 搜索关键词
 * @returns 带高亮标记的 HTML 字符串
 */
export function highlightSearchQuery(text: string, query: string): string {
  if (!query || !text) return text

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900">$1</mark>')
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 解析搜索查询
 * 支持标签搜索 (#tag)、用户搜索 (@user)、精确匹配 ("exact phrase")
 */
export interface ParsedQuery {
  keywords: string[]
  tags: string[]
  users: string[]
  exactPhrases: string[]
}

export function parseSearchQuery(query: string): ParsedQuery {
  const result: ParsedQuery = {
    keywords: [],
    tags: [],
    users: [],
    exactPhrases: []
  }

  // 提取精确短语 "..."
  const exactPhraseRegex = /"([^"]+)"/g
  let match
  while ((match = exactPhraseRegex.exec(query)) !== null) {
    result.exactPhrases.push(match[1])
    query = query.replace(match[0], '')
  }

  // 提取标签 #tag
  const tagRegex = /#(\w+)/g
  while ((match = tagRegex.exec(query)) !== null) {
    result.tags.push(match[1])
    query = query.replace(match[0], '')
  }

  // 提取用户 @user
  const userRegex = /@(\w+)/g
  while ((match = userRegex.exec(query)) !== null) {
    result.users.push(match[1])
    query = query.replace(match[0], '')
  }

  // 剩余的作为关键词
  const keywords = query
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
  
  result.keywords = keywords

  return result
}

/**
 * 构建搜索 URL
 */
export function buildSearchUrl(params: {
  query?: string
  tags?: string[]
  category?: string
  sortBy?: string
  timeRange?: string
}): string {
  const searchParams = new URLSearchParams()

  if (params.query) searchParams.set('q', params.query)
  if (params.tags && params.tags.length > 0) {
    searchParams.set('tags', params.tags.join(','))
  }
  if (params.category) searchParams.set('category', params.category)
  if (params.sortBy) searchParams.set('sort', params.sortBy)
  if (params.timeRange) searchParams.set('time', params.timeRange)

  return `/search?${searchParams.toString()}`
}

/**
 * 从 URL 解析搜索参数
 */
export function parseSearchUrl(searchParams: URLSearchParams) {
  return {
    query: searchParams.get('q') || '',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sort') || 'created_at',
    timeRange: searchParams.get('time') || 'all'
  }
}

/**
 * 生成搜索建议
 */
export function generateSearchSuggestions(query: string, baseKeywords: string[]): string[] {
  const suggestions: string[] = []
  
  // 添加基础关键词组合
  const suffixes = ['插画', '概念艺术', '角色设计', '场景', '壁纸']
  suffixes.forEach(suffix => {
    suggestions.push(`${query} ${suffix}`)
  })

  // 添加相关关键词
  baseKeywords.forEach(keyword => {
    if (keyword.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push(keyword)
    }
  })

  return suggestions.slice(0, 5)
}

/**
 * 计算搜索相关性得分
 */
export function calculateRelevanceScore(
  item: {
    title: string
    description?: string
    tags?: string[]
  },
  query: string
): number {
  let score = 0
  const lowerQuery = query.toLowerCase()

  // 标题匹配（权重最高）
  if (item.title.toLowerCase().includes(lowerQuery)) {
    score += 10
    // 完全匹配额外加分
    if (item.title.toLowerCase() === lowerQuery) {
      score += 20
    }
  }

  // 描述匹配
  if (item.description?.toLowerCase().includes(lowerQuery)) {
    score += 5
  }

  // 标签匹配
  if (item.tags) {
    item.tags.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) {
        score += 3
      }
      if (tag.toLowerCase() === lowerQuery) {
        score += 7
      }
    })
  }

  return score
}

/**
 * 格式化搜索结果数量
 */
export function formatResultCount(count: number): string {
  if (count === 0) return '没有结果'
  if (count === 1) return '1 个结果'
  if (count < 1000) return `${count} 个结果`
  if (count < 10000) return `约 ${Math.floor(count / 100) * 100} 个结果`
  if (count < 100000) return `约 ${Math.floor(count / 1000) * 1000} 个结果`
  return `超过 ${Math.floor(count / 10000) * 10000} 个结果`
}

/**
 * 检查搜索查询是否有效
 */
export function isValidSearchQuery(query: string): boolean {
  if (!query || query.trim().length === 0) return false
  if (query.trim().length < 2) return false
  if (query.trim().length > 100) return false
  
  // 检查是否只包含特殊字符
  if (!/[a-zA-Z0-9\u4e00-\u9fa5]/.test(query)) return false
  
  return true
}

/**
 * 清理搜索查询
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, ' ') // 多个空格替换为单个
    .replace(/[<>]/g, '') // 移除 HTML 标签字符
    .slice(0, 100) // 限制长度
}

/**
 * 获取搜索建议的缓存键
 */
export function getSearchCacheKey(query: string): string {
  return `search:suggestions:${query.toLowerCase()}`
}

/**
 * 搜索结果排序
 */
export function sortSearchResults<T extends { created_at: string; like_count: number; view_count: number }>(
  results: T[],
  sortBy: 'created_at' | 'like_count' | 'view_count' | 'relevance',
  relevanceScores?: Map<string, number>
): T[] {
  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      
      case 'like_count':
        return b.like_count - a.like_count
      
      case 'view_count':
        return b.view_count - a.view_count
      
      case 'relevance':
        if (relevanceScores) {
          const scoreA = relevanceScores.get((a as any).id) || 0
          const scoreB = relevanceScores.get((b as any).id) || 0
          return scoreB - scoreA
        }
        return 0
      
      default:
        return 0
    }
  })
}
