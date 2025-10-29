'use client'

import { useState, useEffect } from 'react'
import { imageService } from '@/lib/services/image-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugConnectionPage() {
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [imagesResult, setImagesResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const result = await imageService.testConnection()
      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      })
    }
    setLoading(false)
  }

  const testImageFetch = async () => {
    setLoading(true)
    try {
      const result = await imageService.getImages({ limit: 5 })
      setImagesResult({
        success: true,
        count: result.length,
        data: result
      })
    } catch (error) {
      setImagesResult({
        success: false,
        error: error instanceof Error ? error.message : 'Fetch failed'
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">数据库连接调试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>数据库连接测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? '测试中...' : '测试连接'}
            </Button>
            
            {connectionResult && (
              <div className="space-y-2">
                <div className={`p-3 rounded ${connectionResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  状态: {connectionResult.success ? '连接成功' : '连接失败'}
                </div>
                
                {connectionResult.error && (
                  <div className="p-3 bg-red-50 rounded">
                    <strong>错误:</strong> {connectionResult.error}
                  </div>
                )}
                
                {connectionResult.tableInfo && (
                  <div className="p-3 bg-blue-50 rounded">
                    <strong>表信息:</strong>
                    <pre className="mt-2 text-sm">
                      {JSON.stringify(connectionResult.tableInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>图片获取测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testImageFetch} disabled={loading}>
              {loading ? '获取中...' : '获取图片'}
            </Button>
            
            {imagesResult && (
              <div className="space-y-2">
                <div className={`p-3 rounded ${imagesResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  状态: {imagesResult.success ? `成功获取 ${imagesResult.count} 张图片` : '获取失败'}
                </div>
                
                {imagesResult.error && (
                  <div className="p-3 bg-red-50 rounded">
                    <strong>错误:</strong> {imagesResult.error}
                  </div>
                )}
                
                {imagesResult.data && (
                  <div className="p-3 bg-blue-50 rounded max-h-64 overflow-y-auto">
                    <strong>数据样本:</strong>
                    <pre className="mt-2 text-sm">
                      {JSON.stringify(imagesResult.data.slice(0, 2), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>环境变量检查</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置'}
            </div>
            <div>
              <strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置'}
            </div>
            <div>
              <strong>Storage Bucket:</strong> {process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'community-images'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}