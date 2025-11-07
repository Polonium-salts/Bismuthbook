import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 返回模拟的热门搜索数据
    // TODO: 当数据库类型更新后，可以使用 RPC 函数获取真实数据
    const defaultTrending = [
      { query: '动漫少女', search_count: 1234, unique_users: 89 },
      { query: '科幻场景', search_count: 856, unique_users: 67 },
      { query: '概念艺术', search_count: 742, unique_users: 54 },
      { query: '角色设计', search_count: 623, unique_users: 45 },
      { query: '风景画', search_count: 512, unique_users: 38 },
      { query: '机甲', search_count: 489, unique_users: 36 },
      { query: '奇幻', search_count: 456, unique_users: 32 },
      { query: '赛博朋克', search_count: 398, unique_users: 28 },
      { query: '古风', search_count: 367, unique_users: 25 },
      { query: '可爱', search_count: 345, unique_users: 23 }
    ]

    return NextResponse.json({
      trending: defaultTrending
    })
  } catch (error) {
    console.error('Trending searches error:', error)
    
    // 返回默认数据
    return NextResponse.json({
      trending: [
        { query: '动漫少女', search_count: 1234, unique_users: 89 },
        { query: '科幻场景', search_count: 856, unique_users: 67 },
        { query: '概念艺术', search_count: 742, unique_users: 54 }
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

    // TODO: 当数据库类型更新后，使用 RPC 函数记录搜索
    // 目前只记录到控制台
    console.log('Search logged:', query.trim())

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Log search error:', error)
    // 即使记录失败也返回成功，不影响用户体验
    return NextResponse.json({ success: true })
  }
}
