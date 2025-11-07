import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const supabase = createClient()

    // 搜索标签
    const { data: tags } = await supabase
      .from('tags')
      .select('name, usage_count')
      .ilike('name', `%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(5)

    // 搜索分类
    const { data: categories } = await supabase
      .from('categories')
      .select('name, artwork_count')
      .ilike('name', `%${query}%`)
      .order('artwork_count', { ascending: false })
      .limit(3)

    // 搜索艺术家
    const { data: artists } = await supabase
      .from('profiles')
      .select('username, artwork_count')
      .ilike('username', `%${query}%`)
      .order('artwork_count', { ascending: false })
      .limit(3)

    // 组合建议
    const suggestions = [
      ...(tags || []).map(tag => ({
        type: 'tag',
        text: tag.name,
        count: tag.usage_count
      })),
      ...(categories || []).map(cat => ({
        type: 'category',
        text: cat.name,
        count: cat.artwork_count
      })),
      ...(artists || []).map(artist => ({
        type: 'artist',
        text: artist.username,
        count: artist.artwork_count
      }))
    ]

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
