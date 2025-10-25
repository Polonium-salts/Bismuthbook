"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, Upload, Heart, LogOut, Plus } from "lucide-react"
import { useAuth } from "@/lib/providers/auth-provider"
import { AuthModal } from "./auth-modal"
import { UploadModal } from "@/components/upload/upload-modal"
import { toast } from "sonner"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  const handleLogin = () => {
    setAuthMode("login")
    setShowAuthModal(true)
  }

  const handleRegister = () => {
    setAuthMode("register")
    setShowAuthModal(true)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("已退出登录")
    } catch (error) {
      toast.error("退出登录失败")
    }
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={handleLogin}>
            登录
          </Button>
          <Button onClick={handleRegister}>
            注册
          </Button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode={authMode}
        />
      </>
    )
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0]
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <>
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden sm:flex"
          onClick={() => setShowUploadModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          上传作品
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>
                  {displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Upload className="mr-2 h-4 w-4" />
              <span>我的作品</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Heart className="mr-2 h-4 w-4" />
              <span>我的收藏</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>设置</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </>
  )
}