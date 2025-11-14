"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/providers/auth-provider"
import { notificationService } from "@/lib/services/notification-service"
import { NotificationType } from "@/lib/types/notification"
import { toast } from "sonner"
import { Bell, Heart, MessageCircle, UserPlus, AlertCircle } from "lucide-react"

export default function TestNotificationsPage() {
  const { user, profile } = useAuth()
  const [type, setType] = useState<NotificationType>('like')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateTestNotification = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    if (!title || !message) {
      toast.error('请填写标题和消息')
      return
    }

    try {
      setLoading(true)
      await notificationService.createNotification(
        user.id,
        type,
        title,
        message,
        {
          link: link || undefined,
          actorId: user.id,
          actorName: profile?.username || profile?.full_name || '测试用户',
          actorAvatar: profile?.avatar_url || undefined
        }
      )
      toast.success('测试通知创建成功！')
      
      // 清空表单
      setTitle('')
      setMessage('')
      setLink('')
    } catch (error) {
      console.error('创建测试通知失败:', error)
      toast.error('创建测试通知失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuickTest = async (testType: NotificationType) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    const testData: Record<NotificationType, { title: string; message: string; link?: string }> = {
      like: {
        title: '新的点赞',
        message: '测试用户 点赞了您的作品《测试作品》',
        link: '/artwork/test-id'
      },
      comment: {
        title: '新的评论',
        message: '测试用户 评论了您的作品：这是一条测试评论',
        link: '/artwork/test-id'
      },
      follow: {
        title: '新的关注者',
        message: '测试用户 关注了您',
        link: '/user/test-user'
      },
      mention: {
        title: '有人提到了您',
        message: '测试用户 在评论中提到了您',
        link: '/artwork/test-id'
      },
      reply: {
        title: '新的回复',
        message: '测试用户 回复了您的评论：这是一条测试回复',
        link: '/artwork/test-id'
      },
      system: {
        title: '系统通知',
        message: '这是一条系统测试通知',
        link: '/notifications'
      }
    }

    try {
      setLoading(true)
      const data = testData[testType]
      await notificationService.createNotification(
        user.id,
        testType,
        data.title,
        data.message,
        {
          link: data.link,
          actorId: user.id,
          actorName: profile?.username || profile?.full_name || '测试用户',
          actorAvatar: profile?.avatar_url || undefined
        }
      )
      toast.success(`${data.title} 创建成功！`)
    } catch (error) {
      console.error('创建测试通知失败:', error)
      toast.error('创建测试通知失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">通知测试页面</h2>
            <p className="text-muted-foreground mb-6">
              请先登录以测试通知功能
            </p>
            <Button onClick={() => window.location.href = '/?auth=login'}>
              登录
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">通知功能测试</h1>
          <p className="text-muted-foreground">
            在这里测试各种类型的通知
          </p>
        </div>

        <div className="grid gap-6">
          {/* 快速测试 */}
          <Card>
            <CardHeader>
              <CardTitle>快速测试</CardTitle>
              <CardDescription>
                点击按钮快速创建各类型的测试通知
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleCreateQuickTest('like')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4 text-red-500" />
                  点赞通知
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateQuickTest('comment')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  评论通知
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateQuickTest('follow')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4 text-green-500" />
                  关注通知
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateQuickTest('mention')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                  提及通知
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateQuickTest('reply')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-orange-500" />
                  回复通知
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateQuickTest('system')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4 text-gray-500" />
                  系统通知
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 自定义通知 */}
          <Card>
            <CardHeader>
              <CardTitle>自定义通知</CardTitle>
              <CardDescription>
                创建自定义内容的测试通知
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>通知类型</Label>
                <Select value={type} onValueChange={(value) => setType(value as NotificationType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="like">点赞</SelectItem>
                    <SelectItem value="comment">评论</SelectItem>
                    <SelectItem value="follow">关注</SelectItem>
                    <SelectItem value="mention">提及</SelectItem>
                    <SelectItem value="reply">回复</SelectItem>
                    <SelectItem value="system">系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>标题</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入通知标题"
                />
              </div>

              <div className="space-y-2">
                <Label>消息内容</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="输入通知消息内容"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>链接（可选）</Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/artwork/123"
                />
              </div>

              <Button
                onClick={handleCreateTestNotification}
                disabled={loading}
                className="w-full"
              >
                {loading ? '创建中...' : '创建测试通知'}
              </Button>
            </CardContent>
          </Card>

          {/* 说明 */}
          <Card>
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. 点击&ldquo;快速测试&rdquo;按钮可以快速创建预设的测试通知</p>
              <p>2. 使用&ldquo;自定义通知&rdquo;可以创建自定义内容的通知</p>
              <p>3. 创建的通知会立即显示在 Header 的通知图标中</p>
              <p>4. 点击通知图标可以查看通知列表</p>
              <p>5. 访问 /notifications 页面可以查看完整的通知列表</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
