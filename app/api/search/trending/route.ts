import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()

    // 获取热门搜索关键词（从搜索日志表）
    // 注意：这需要你在数据库中创建一个 search_logs 表
    const { data: trendingSearches } = await supabase
      .from('search_logs')
      .select('query, count')
      .order('count', { ascending: false })
      .limit(10)

    // 如果没有搜索日志表，返回默认热门搜索
    const defaultTrending = [
      { query: '动漫少女', count: 1234 },
      { query: '科幻场景', count: 856 },
      { query: '概念艺术', count: 742 },
      { query: '角色设计', count: 623 },
      { query: '风景画', count: 512 },
      { query: '机甲', count: 489 },
      { query: '奇幻', count: 456 },
      { query: '赛博朋克', count: 398 },
      { query: '古风', count: 367 },
      { query: '可爱', count: 345 }
    ]

    return NextResponse.json({
      trending: trendingSearches || defaultTrending
    })
  } catch (error) {
    console.error('Trending searches error:', error)
    
    // 返回默认数据
    return NextResponse.json({
      trending: [
        { query: '动漫少女', count: 1234 },
        { query: '科幻场景', count: 856 },
        { query: '概念艺术', count: 742 }
      ]
    })
  }
}

// 记录搜索
export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 记录搜索（需要创建 search_logs 表）
    await supabase
      .from('search_logs')
      .insert({
        query: query.trim(),
        searched_at: new Date().toISOString()
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Log search error:', error)
    return NextResponse.json(
      { error: 'Failed to log search' },
      { status: 500 }
    )
  }
}
