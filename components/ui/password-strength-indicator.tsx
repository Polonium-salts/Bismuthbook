'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  validatePassword, 
  getPasswordStrengthColor, 
  getPasswordStrengthText, 
  getPasswordStrengthWidth,
  type PasswordValidationResult 
} from '@/lib/utils/password-validation'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export function PasswordStrengthIndicator({ 
  password, 
  className
}: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password)
  
  if (!password) {
    return null
  }

  return (
    <div className={cn("space-y-1", className)}>
      {/* 强度指示器 */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">强度</span>
        <span className={cn("font-medium", getPasswordStrengthColor(validation.strength))}>
          {getPasswordStrengthText(validation.strength)}
        </span>
      </div>
      
      {/* 进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            validation.strength === 'weak' && "bg-red-500",
            validation.strength === 'medium' && "bg-yellow-500",
            validation.strength === 'strong' && "bg-green-500"
          )}
          style={{ width: getPasswordStrengthWidth(validation.score) }}
        />
      </div>
    </div>
  )
}

export type { PasswordValidationResult }