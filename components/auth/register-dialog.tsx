"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Github, Mail } from "lucide-react"
import { useAuth } from "@/lib/providers/auth-provider"
import { toast } from "sonner"
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator"
import { validatePassword } from "@/lib/utils/password-validation"

interface RegisterDialogProps {
  children: React.ReactNode
}

export function RegisterDialog({ children }: RegisterDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  })

  const { signUp } = useAuth()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    if (!formData.username.trim()) {
      toast.error("请输入用户名")
      return
    }
    
    if (!formData.email.trim()) {
      toast.error("请输入邮箱")
      return
    }
    
    // 使用新的密码复杂度验证
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      toast.error(`密码不符合要求：${passwordValidation.errors[0]}`)
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }
    
    if (!formData.agreeToTerms) {
      toast.error("请同意服务条款和隐私政策")
      return
    }

    setLoading(true)
    
    try {
      await signUp(formData.email, formData.password, formData.username)
      toast.success("注册成功！请查看邮箱验证链接")
      // 重置表单
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "注册失败，请重试"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>注册 BismuthBook</DialogTitle>
          <DialogDescription>
            创建您的账户，开始分享和发现精彩作品
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 社交注册 */}
          <div className="grid gap-2">
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              使用 GitHub 注册
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              使用 Google 注册
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或者
              </span>
            </div>
          </div>

          {/* 注册表单 */}
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="输入用户名（将作为显示名称）"
                value={formData.username}
                onChange={(e) => updateFormData("username", e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="输入密码"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.password && (
                <PasswordStrengthIndicator password={formData.password} />
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData("agreeToTerms", checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                我同意{" "}
                <a href="#" className="text-primary hover:underline">
                  服务条款
                </a>{" "}
                和{" "}
                <a href="#" className="text-primary hover:underline">
                  隐私政策
                </a>
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={
                !formData.agreeToTerms || 
                loading || 
                !validatePassword(formData.password).isValid ||
                formData.password !== formData.confirmPassword
              }
            >
              {loading ? "注册中..." : "注册"}
            </Button>
          </form>

          <div className="text-center text-sm">
            已有账户？{" "}
            <a href="#" className="text-primary hover:underline">
              立即登录
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}