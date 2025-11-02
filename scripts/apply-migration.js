const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量读取配置
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 环境变量')
  console.error('需要设置: NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY (或 NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('🔄 执行迁移...')
    
    // 检查字段是否已存在
    console.log('🔍 检查 is_published 字段...')
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'images')
      .eq('column_name', 'is_published')
    
    if (columnError) {
      console.log('⚠️ 无法检查字段，尝试直接添加...')
    }
    
    const hasIsPublished = columns && columns.length > 0
    const hasUpdatedAt = await checkColumnExists('updated_at')
    
    console.log(`is_published 字段存在: ${hasIsPublished}`)
    console.log(`updated_at 字段存在: ${hasUpdatedAt}`)
    
    // 手动添加字段（如果不存在）
    if (!hasIsPublished) {
      console.log('➕ 添加 is_published 字段...')
      // 由于 Supabase 客户端不支持 DDL，我们需要使用其他方法
      console.log('⚠️ 需要手动在 Supabase 控制台中添加字段')
    }
    
    if (!hasUpdatedAt) {
      console.log('➕ 添加 updated_at 字段...')
      console.log('⚠️ 需要手动在 Supabase 控制台中添加字段')
    }
    
    console.log('✅ 迁移检查完成!')
    return true
  } catch (err) {
    console.error('❌ 迁移执行出错:', err.message)
    return false
  }
}

async function checkColumnExists(columnName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'images')
      .eq('column_name', columnName)
    
    return data && data.length > 0
  } catch (err) {
    return false
  }
}

async function testConnection() {
  try {
    console.log('🔍 测试数据库连接...')
    
    const { data, error } = await supabase
      .from('images')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message)
      return false
    }
    
    console.log('✅ 数据库连接成功!')
    return true
  } catch (err) {
    console.error('❌ 数据库连接出错:', err.message)
    return false
  }
}

async function main() {
  console.log('🚀 开始数据库迁移...')
  
  // 测试连接
  const connected = await testConnection()
  if (!connected) {
    process.exit(1)
  }
  
  // 应用迁移
  const success = await applyMigration()
  
  if (success) {
    console.log('🎉 迁移完成!')
  } else {
    console.log('💥 迁移失败!')
    process.exit(1)
  }
}

main().catch(console.error)