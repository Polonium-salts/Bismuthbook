# 图片删除功能修复文档

## 问题描述

之前在删除作品时，前端会从数据库中删除记录，但Supabase Storage中的实际图片文件并没有被删除，导致存储空间浪费。

## 问题原因

1. **路径格式不匹配**：数据库中存储的`image_url`可能是完整的URL（如：`https://project.supabase.co/storage/v1/object/public/bucket/path.jpg`），而Supabase Storage的删除API需要的是相对路径（如：`path.jpg`）

2. **缺少路径提取逻辑**：原有代码直接将URL传递给删除函数，没有提取实际的存储路径

## 解决方案

### 1. 新增路径提取函数 (`lib/supabase.ts`)

```typescript
export const extractStoragePath = (urlOrPath: string): string => {
  // 如果已经是路径，直接返回
  if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
    return urlOrPath
  }

  // 从完整URL中提取存储路径
  const url = new URL(urlOrPath)
  const pathParts = url.pathname.split('/')
  const publicIndex = pathParts.indexOf('public')
  
  if (publicIndex !== -1 && publicIndex < pathParts.length - 2) {
    return pathParts.slice(publicIndex + 2).join('/')
  }
  
  throw new Error('Could not extract storage path from URL')
}
```

### 2. 改进删除函数 (`lib/supabase.ts`)

```typescript
export const deleteImage = async (pathOrUrl: string) => {
  // 提取实际的存储路径
  const storagePath = extractStoragePath(pathOrUrl)
  
  console.log('Deleting from storage:', storagePath)
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([storagePath])

  if (error) throw error
}
```

### 3. 优化服务层删除逻辑 (`lib/services/image-service.ts`)

```typescript
async deleteImage(id: string, userId: string) {
  // 1. 获取图片信息
  const { data: image } = await supabase
    .from('images')
    .select('image_url')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  // 2. 删除存储文件（使用改进的deleteImage函数）
  try {
    await deleteImage(image.image_url)
  } catch (storageError) {
    console.error('Storage deletion failed:', storageError)
    // 继续删除数据库记录，避免孤立记录
  }

  // 3. 删除数据库记录
  await supabase
    .from('images')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
}
```

## 测试

创建了测试工具 `lib/utils/storage-path-test.ts` 来验证路径提取功能：

```bash
# 运行测试
npm run test:storage-path
```

测试用例包括：
- 完整的Supabase Storage URL
- 简单的文件路径
- 带子目录的路径
- 完整URL带子目录

## 改进点

1. **健壮的路径处理**：支持多种URL格式和路径格式
2. **详细的日志记录**：便于调试和追踪删除过程
3. **错误处理**：即使存储删除失败，也会继续删除数据库记录
4. **用户反馈**：在前端显示详细的错误信息

## 使用示例

```typescript
// 在任何需要删除图片的地方
await imageService.deleteImage(imageId, userId)
```

函数会自动：
1. 从数据库获取图片URL
2. 提取存储路径
3. 删除Storage中的文件
4. 删除数据库记录

## 注意事项

1. **权限检查**：确保只有图片所有者可以删除
2. **事务处理**：先删除存储文件，再删除数据库记录
3. **错误恢复**：如果存储删除失败，仍会删除数据库记录以避免孤立数据
4. **日志记录**：所有操作都有详细的控制台日志

## 相关文件

- `lib/supabase.ts` - 存储操作辅助函数
- `lib/services/image-service.ts` - 图片服务层
- `app/my-works/page.tsx` - 我的作品页面
- `lib/utils/storage-path-test.ts` - 测试工具

## 后续优化建议

1. 考虑添加软删除功能（标记为已删除而不是立即删除）
2. 实现批量删除功能
3. 添加删除确认对话框的增强版本
4. 考虑添加回收站功能
