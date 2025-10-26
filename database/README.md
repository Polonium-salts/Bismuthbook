# 数据库设置

## 设置步骤

1. **登录 Supabase Dashboard**
   - 访问 [https://supabase.com](https://supabase.com)
   - 登录你的账户

2. **创建新项目或使用现有项目**
   - 如果还没有项目，创建一个新项目
   - 记录项目的 URL 和 API 密钥

3. **执行数据库迁移**
   - 在 Supabase Dashboard 中，进入 "SQL Editor"
   - 复制 `init.sql` 文件的内容并执行
   - 这将创建所有必要的表、索引、函数和安全策略

4. **配置环境变量**
   - 在项目根目录创建 `.env.local` 文件
   - 添加以下环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的_supabase_项目_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_匿名_密钥
   ```

## 表结构说明

### user_profiles
用户资料表，存储用户的基本信息
- `id`: 用户ID（关联 auth.users）
- `username`: 用户名（唯一）
- `full_name`: 全名
- `avatar_url`: 头像URL
- `bio`: 个人简介
- `website`: 个人网站

### images
图片表，存储所有上传的图片信息
- `id`: 图片ID
- `title`: 图片标题
- `description`: 图片描述
- `image_url`: 图片URL
- `user_id`: 上传用户ID
- `like_count`: 点赞数
- `view_count`: 浏览数
- `comment_count`: 评论数
- `tags`: 标签数组
- `category`: 分类
- `is_featured`: 是否精选

### likes
点赞表，记录用户对图片的点赞
- `user_id`: 用户ID
- `image_id`: 图片ID
- 唯一约束：一个用户只能对同一张图片点赞一次

### favorites
收藏表，记录用户收藏的图片
- `user_id`: 用户ID
- `image_id`: 图片ID
- 唯一约束：一个用户只能收藏同一张图片一次

### comments
评论表，存储用户对图片的评论
- `id`: 评论ID
- `content`: 评论内容
- `user_id`: 评论用户ID
- `image_id`: 被评论的图片ID

## 安全策略 (RLS)

所有表都启用了行级安全策略：
- 用户只能修改自己的数据
- 公开数据（如图片、评论）所有人都可以查看
- 私人数据（如收藏）只有用户自己可以查看

## 数据库函数

- `increment_like_count(image_id)`: 增加图片点赞数
- `decrement_like_count(image_id)`: 减少图片点赞数
- `increment_view_count(image_id)`: 增加图片浏览数
- `update_comment_count()`: 自动更新图片评论数（触发器）