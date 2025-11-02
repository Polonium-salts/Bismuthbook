# Vercel 部署指南

本项目已经配置好可以直接部署到 Vercel 平台。

## 部署步骤

### 1. 准备代码仓库
确保您的代码已经推送到 GitHub、GitLab 或 Bitbucket 仓库。

### 2. 在 Vercel 中导入项目
1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 选择您的 Git 仓库
4. 导入 Bismuth Book 项目

### 3. 配置环境变量
在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=community-images
```

**获取 Supabase 配置信息：**
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 在 Settings > API 中找到：
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. 部署配置
项目已包含 `vercel.json` 配置文件，包含以下优化：
- 构建命令：`npm run build`
- 输出目录：`.next`
- 框架：Next.js
- 区域：香港和新加坡（亚洲优化）
- 安全头配置
- 静态资源缓存优化

### 5. 部署
1. 点击 "Deploy" 按钮
2. 等待构建完成
3. 访问生成的 URL 查看部署结果

## 自动部署
配置完成后，每次推送到主分支都会自动触发重新部署。

## 故障排除

### 构建失败
- 检查环境变量是否正确配置
- 确保 Supabase 项目正常运行
- 查看构建日志中的错误信息

### 运行时错误
- 验证 Supabase URL 和密钥是否有效
- 检查 Supabase 项目的 RLS 策略配置
- 确保数据库表结构正确

## 性能优化
项目已包含以下性能优化：
- 图片优化配置
- 静态资源缓存
- 代码分割
- 生产环境 console.log 移除

## 监控
部署后可以在 Vercel Dashboard 中监控：
- 部署状态
- 性能指标
- 错误日志
- 访问统计