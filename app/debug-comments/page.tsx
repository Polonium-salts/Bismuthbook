'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { interactionService } from '@/lib/services/interaction-service'

export default function DebugCommentsPage() {
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [commentsResult, setCommentsResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const result = await interactionService.testConnection()
      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testGetComments = async () => {
    setIsLoading(true)
    try {
      // 使用一个测试 imageId，如果没有真实数据，会返回空数组
      const testImageId = '00000000-0000-0000-0000-000000000000'
      const result = await interactionService.getImageComments(testImageId)
      setCommentsResult({
        success: true,
        data: result,
        count: result.length
      })
    } catch (error) {
      setCommentsResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorDetails: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">评论功能调试页面</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>数据库连接测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '测试中...' : '测试连接'}
            </Button>
            
            {connectionResult && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">连接结果:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(connectionResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>获取评论测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testGetComments} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '测试中...' : '获取评论'}
            </Button>
            
            {commentsResult && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">评论结果:</h3>
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(commentsResult, null, 2)}
                </pre>
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
          <div className="space-y-2 text-sm">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> 
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置'}
              </span>
            </div>
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> 
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置'}
              </span>
            </div>
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET:</strong> 
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ? '已设置' : '未设置'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}