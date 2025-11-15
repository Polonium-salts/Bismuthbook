/**
 * 测试存储路径提取功能
 * 用于验证从各种格式的URL中正确提取存储路径
 */

import { extractStoragePath } from '../supabase'

// 测试用例
const testCases = [
  {
    name: '完整的Supabase Storage URL',
    input: 'https://your-project.supabase.co/storage/v1/object/public/community-images/1234567890-image.jpg',
    expected: '1234567890-image.jpg'
  },
  {
    name: '简单的文件路径',
    input: '1234567890-image.jpg',
    expected: '1234567890-image.jpg'
  },
  {
    name: '带子目录的路径',
    input: 'uploads/2024/1234567890-image.jpg',
    expected: 'uploads/2024/1234567890-image.jpg'
  },
  {
    name: '完整URL带子目录',
    input: 'https://your-project.supabase.co/storage/v1/object/public/community-images/uploads/2024/image.jpg',
    expected: 'uploads/2024/image.jpg'
  }
]

export function testStoragePathExtraction() {
  console.log('🧪 Testing storage path extraction...\n')
  
  let passed = 0
  let failed = 0
  
  testCases.forEach(({ name, input, expected }) => {
    try {
      const result = extractStoragePath(input)
      if (result === expected) {
        console.log(`✅ PASS: ${name}`)
        console.log(`   Input:    ${input}`)
        console.log(`   Expected: ${expected}`)
        console.log(`   Got:      ${result}\n`)
        passed++
      } else {
        console.log(`❌ FAIL: ${name}`)
        console.log(`   Input:    ${input}`)
        console.log(`   Expected: ${expected}`)
        console.log(`   Got:      ${result}\n`)
        failed++
      }
    } catch (error) {
      console.log(`❌ ERROR: ${name}`)
      console.log(`   Input: ${input}`)
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
      failed++
    }
  })
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)
  return { passed, failed }
}

// 如果直接运行此文件
if (require.main === module) {
  testStoragePathExtraction()
}
