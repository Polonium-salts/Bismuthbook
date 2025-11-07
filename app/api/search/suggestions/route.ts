import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // 模拟搜索建议数据
    const allSuggestions = [
      { type: 'keyword', text: '动漫少女', count: 1234 },
      { type: 'keyword', text: '动漫风景', count: 856 },
      { type: 'keyword', text: '科幻场景', count: 742 },
      { type: 'keyword', text: '科幻机甲', count: 623 },
      { type: 'tag', text: '原创', count: 2341 },
      { type: 'tag', text: '同人', count: 1876 },
      { type: 'tag', text: '插画', count: 1654 },
      { type: 'tag', text: '概念艺术', count: 1432 },
      { type: 'category', text: '插画', count: 3456 },
      { type: 'category', text: '漫画', count: 2345 },
      { type: 'category', text: '概念艺术', count: 1987 },
      { type: 'artist', text: '知名画师', count: 234 },
    ]

    // 根据查询过滤建议
    const lowerQuery = query.toLowerCase()
    const filteredSuggestions = allSuggestions
      .filter(s => s.text.toLowerCase().includes(lowerQuery))
      .slice(0, 8)

    // 如果没有匹配的建议，生成一些通用建议
    if (filteredSuggestions.length === 0) {
      const genericSuggestions = [
        { type: 'keyword', text: `${query} 插画`, count: 100 },
        { type: 'keyword', text: `${query} 概念艺术`, count: 80 },
        { type: 'keyword', text: `${query} 角色设计`, count: 60 },
      ]
      return NextResponse.json({ suggestions: genericSuggestions })
    }

    return NextResponse.json({ suggestions: filteredSuggestions })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}
