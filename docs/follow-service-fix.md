# Follow Service 修复文档

## 问题描述

在使用关注功能时，出现以下错误：
```
Error: 已经关注了该用户
at FollowService.followUser (lib\services\follow-service.ts:86:17)
```

## 问题原因

### 问题1：重复关注时抛出错误

在`follow-service.ts`中，当检测到用户已经关注时，代码会抛出错误：

```typescript
if (cachedStatus === true) {
  throw new Error('已经关注了该用户')  // ❌ 不应该抛出错误
}
```

这导致UI层面出现错误提示，影响用户体验。

### 问题2：参数顺序错误

在`user-card.tsx`中，调用`followUser`时参数顺序错误：

```typescript
// ❌ 错误：参数顺序反了
await followService.followUser(currentUser.id, user.id)

// ✅ 正确：followUser(followingId, followerId)
await followService.followUser(user.id, currentUser.id)
```

## 解决方案

### 1. 修复Follow Service (`lib/services/follow-service.ts`)

#### 改进重复关注处理

```typescript
// 检查缓存中的关注状态
if (cachedStatus === true) {
  // ✅ 已经关注，直接返回，不抛出错误
  console.log('User already following, skipping')
  return
}

// 检查数据库
if (existingFollows && existingFollows.length > 0) {
  this.setCache(this.followStatusCache, cacheKey, true)
  // ✅ 已经关注，直接返回，不抛出错误
  console.log('User already following (from DB), skipping')
  return
}
```

#### 处理唯一约束冲突

```typescript
const { error: insertError } = await supabase
  .from('follows')
  .insert({
    follower_id: followerId,
    following_id: followingId
  })

if (insertError) {
  // ✅ 检查是否是唯一约束冲突（已经关注）
  if (insertError.code === '23505') {
    this.setCache(this.followStatusCache, cacheKey, true)
    console.log('User already following (unique constraint), skipping')
    return
  }
  throw insertError
}
```

### 2. 修复User Card (`components/user/user-card.tsx`)

#### 修正参数顺序

```typescript
const handleFollowToggle = async () => {
  if (!currentUser || isOwnProfile) return

  setIsLoading(true)
  try {
    if (isFollowingState) {
      // ✅ unfollowUser(followingId, followerId)
      await followService.unfollowUser(user.id, currentUser.id)
      setIsFollowingState(false)
      onFollowChange?.(user.id, false)
    } else {
      // ✅ followUser(followingId, followerId)
      await followService.followUser(user.id, currentUser.id)
      setIsFollowingState(true)
      onFollowChange?.(user.id, true)
    }
  } catch (error) {
    console.error('Error toggling follow:', error)
    const errorMessage = error instanceof Error ? error.message : '操作失败'
    console.error('Follow toggle error:', errorMessage)
  } finally {
    setIsLoading(false)
  }
}
```

## 参数说明

### Follow Service 方法签名

```typescript
// 关注用户
followUser(followingId: string, followerId: string): Promise<void>
// followingId: 被关注的用户ID
// followerId: 关注者的用户ID

// 取消关注
unfollowUser(followingId: string, followerId: string): Promise<void>
// followingId: 被取消关注的用户ID
// followerId: 取消关注的用户ID

// 检查关注状态
isFollowing(followingId: string, followerId: string): Promise<boolean>
// followingId: 被检查的用户ID
// followerId: 检查者的用户ID
```

### 使用示例

```typescript
// 用户A关注用户B
await followService.followUser(userB.id, userA.id)

// 用户A取消关注用户B
await followService.unfollowUser(userB.id, userA.id)

// 检查用户A是否关注了用户B
const isFollowing = await followService.isFollowing(userB.id, userA.id)
```

## 改进点

### 1. 幂等性

关注操作现在是幂等的：
- 多次关注同一用户不会报错
- 自动检测并跳过重复操作
- 保持状态一致性

### 2. 错误处理

```typescript
// ✅ 优雅处理重复关注
if (cachedStatus === true) {
  return  // 直接返回，不抛出错误
}

// ✅ 处理数据库唯一约束
if (insertError.code === '23505') {
  return  // 已存在，直接返回
}
```

### 3. 缓存管理

```typescript
// 更新缓存确保状态一致
this.setCache(this.followStatusCache, cacheKey, true)

// 清理相关统计缓存
this.followStatsCache.delete(followerId)
this.followStatsCache.delete(followingId)
```

## 测试验证

### 测试用例1：正常关注

```typescript
// 用户A关注用户B
await followService.followUser(userB.id, userA.id)
// 预期：成功创建关注关系
```

### 测试用例2：重复关注

```typescript
// 用户A已经关注了用户B，再次关注
await followService.followUser(userB.id, userA.id)
// 预期：静默返回，不报错
```

### 测试用例3：取消关注

```typescript
// 用户A取消关注用户B
await followService.unfollowUser(userB.id, userA.id)
// 预期：成功删除关注关系
```

### 测试用例4：检查状态

```typescript
// 检查用户A是否关注了用户B
const isFollowing = await followService.isFollowing(userB.id, userA.id)
// 预期：返回true或false
```

## 数据库约束

```sql
-- follows表的唯一约束
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)  -- 防止重复关注
);
```

## 错误代码说明

- `23505`: PostgreSQL唯一约束冲突
  - 表示尝试插入重复的关注记录
  - 现在会被优雅处理，不会抛出错误

## 相关文件

- `lib/services/follow-service.ts` - 关注服务
- `components/user/user-card.tsx` - 用户卡片组件
- `app/artwork/[id]/page.tsx` - 作品详情页
- `components/artwork/artwork-detail.tsx` - 作品详情组件

## 注意事项

### 参数顺序

⚠️ **重要**：所有关注相关方法的参数顺序都是：
1. `followingId` - 被关注/操作的用户ID
2. `followerId` - 执行操作的用户ID

### 缓存策略

- 缓存时间：2分钟
- 自动清理过期缓存
- 操作后清理相关统计缓存

### 防止自己关注自己

```typescript
if (followerId === followingId) {
  throw new Error('不能关注自己')
}
```

这个检查仍然会抛出错误，因为这是一个逻辑错误。

## 总结

✅ **已修复**：
- 重复关注不再抛出错误
- 参数顺序正确
- 优雅处理唯一约束冲突
- 保持缓存一致性

🎯 **改进效果**：
- 更好的用户体验
- 幂等的关注操作
- 减少不必要的错误提示
- 更健壮的错误处理

现在关注功能应该可以正常工作，不会出现"已经关注了该用户"的错误了！
