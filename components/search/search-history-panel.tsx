"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchHistory } from "@/hooks/use-search-history"
import { Clock, X, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SearchHistoryPanel() {
  const { history, removeFromHistory, clearHistory } = useSearchHistory()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            搜索历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">暂无搜索历史</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            搜索历史
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                清空
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>清空搜索历史？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将删除所有搜索历史记录，且无法恢复。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearHistory}
                  className="bg-red-600 hover:bg-red-700"
                >
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {history.map((query, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="flex-1 min-w-0 text-sm text-gray-700 hover:text-blue-600 transition-colors truncate"
              >
                {query}
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className={`
                  h-6 w-6 flex-shrink-0 transition-opacity
                  ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={(e) => {
                  e.preventDefault()
                  removeFromHistory(query)
                }}
              >
                <X className="w-3 h-3 text-gray-500 hover:text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
