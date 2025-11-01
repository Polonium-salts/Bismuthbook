"use client"

import { useState, useEffect } from 'react'

interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
  isLoading: boolean
  error: string | null
}

export function useImageDimensions(src: string): ImageDimensions {
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 0,
    height: 0,
    aspectRatio: 3/4, // 默认比例
    isLoading: true,
    error: null
  })

  useEffect(() => {
    if (!src) {
      setDimensions(prev => ({
        ...prev,
        isLoading: false,
        error: 'No image source provided'
      }))
      return
    }

    setDimensions(prev => ({ ...prev, isLoading: true, error: null }))

    const img = new Image()
    
    img.onload = () => {
      const aspectRatio = img.width / img.height
      setDimensions({
        width: img.width,
        height: img.height,
        aspectRatio,
        isLoading: false,
        error: null
      })
    }

    img.onerror = () => {
      setDimensions(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load image'
      }))
    }

    img.src = src
    
    // 清理函数
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return dimensions
}