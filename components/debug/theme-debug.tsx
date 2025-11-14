"use client"

import { useTheme } from "@/lib/providers/theme-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemeDebug() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>主题调试信息</CardTitle>
        <CardDescription>查看当前主题状态</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">主题设置:</span>
            <span className="text-muted-foreground">{theme}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">实际主题:</span>
            <span className="text-muted-foreground">{resolvedTheme}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">系统主题:</span>
            <span className="text-muted-foreground">
              {window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">localStorage:</span>
            <span className="text-muted-foreground">
              {localStorage.getItem("theme") || "未设置"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">快速切换:</p>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="flex-1"
            >
              <Sun className="h-4 w-4 mr-2" />
              浅色
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="flex-1"
            >
              <Moon className="h-4 w-4 mr-2" />
              深色
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
              className="flex-1"
            >
              <Monitor className="h-4 w-4 mr-2" />
              系统
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-background border">
          <p className="text-sm">
            当前背景色应该是 {resolvedTheme === "dark" ? "深色" : "浅色"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
