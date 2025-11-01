export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
  score: number
}

export interface PasswordRequirement {
  test: (password: string) => boolean
  message: string
  weight: number
}

// 密码复杂度要求
export const passwordRequirements: PasswordRequirement[] = [
  {
    test: (password: string) => password.length >= 8,
    message: '8位以上',
    weight: 2
  },
  {
    test: (password: string) => /[a-z]/.test(password),
    message: '小写字母',
    weight: 1
  },
  {
    test: (password: string) => /\d/.test(password),
    message: '包含数字',
    weight: 1
  },


]

// 常见弱密码模式
const weakPasswordPatterns = [
  /^123456/,
  /^password/i,
  /^qwerty/i,
  /^abc123/i,
  /^admin/i,
  /^letmein/i,
  /^welcome/i,
  /^monkey/i,
  /^dragon/i,
  /^master/i,
  /^(.)\\1{2,}/, // 连续重复字符
  /^(\\d{4,})$/, // 纯数字
  /^([a-zA-Z]+)$/, // 纯字母
]

/**
 * 验证密码复杂度
 * @param password 要验证的密码
 * @returns 验证结果
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0
  const maxScore = passwordRequirements.reduce((sum, req) => sum + req.weight, 0)

  // 检查基本要求
  for (const requirement of passwordRequirements) {
    if (requirement.test(password)) {
      score += requirement.weight
    } else {
      // 只有前4个是必需的，后面的是可选的
      if (passwordRequirements.indexOf(requirement) < 4) {
        errors.push(requirement.message)
      }
    }
  }

  // 检查弱密码模式
  for (const pattern of weakPasswordPatterns) {
    if (pattern.test(password)) {
      errors.push('密码过于简单，请使用更复杂的组合')
      score = Math.max(0, score - 2) // 扣分
      break
    }
  }

  // 计算强度
  const strengthPercentage = score / maxScore
  let strength: 'weak' | 'medium' | 'strong'
  
  if (strengthPercentage < 0.4) {
    strength = 'weak'
  } else if (strengthPercentage < 0.7) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  // 如果有必需的错误，则密码无效
  const isValid = errors.length === 0

  return {
    isValid,
    errors,
    strength,
    score: Math.round(strengthPercentage * 100)
  }
}

/**
 * 获取密码强度颜色
 * @param strength 密码强度
 * @returns 对应的颜色类名
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-red-500'
    case 'medium':
      return 'text-yellow-500'
    case 'strong':
      return 'text-green-500'
    default:
      return 'text-gray-500'
  }
}

/**
 * 获取密码强度文本
 * @param strength 密码强度
 * @returns 对应的文本描述
 */
export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return '弱'
    case 'medium':
      return '中等'
    case 'strong':
      return '强'
    default:
      return ''
  }
}

/**
 * 获取密码强度进度条宽度
 * @param score 密码得分 (0-100)
 * @returns 进度条宽度百分比
 */
export function getPasswordStrengthWidth(score: number): string {
  return `${Math.max(10, score)}%`
}