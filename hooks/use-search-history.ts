"use client"

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'search_history'
const MAX_HISTORY_ITEMS = 10

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  // 从 localStorage 加载历史记录
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }, [])

  // 添加搜索记录
  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return

    setHistory((prev) => {
      // 移除重复项并添加到开头
      const newHistory = [
        query,
        ...prev.filter((item) => item !== query)
      ].slice(0, MAX_HISTORY_ITEMS)

      // 保存到 localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      } catch (error) {
        console.error('Failed to save search history:', error)
      }

      return newHistory
    })
  }, [])

  // 删除单个记录
  const removeFromHistory = useCallback((query: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item !== query)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      } catch (error) {
        console.error('Failed to update search history:', error)
      }

      return newHistory
    })
  }, [])

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }, [])

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  }
}
