# Vercel 部署指南

本文档提供了将 Bismuthbook 项目部署到 Vercel 的详细步骤。

## 前置要求

1. GitHub 账户
2. Vercel 账户（可以使用 GitHub 登录）
3. Supabase 项目（用于数据库和认证）

## 部署步骤

### 1. 准备代码仓库

确保你的代码已经推送到 GitHub 仓库。

### 2. 连接 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账户登录
3. 点击 "New Project"
4. 选择你的 Bismuthbook 仓库
5. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_项目_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_匿名_key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=community-images
```

#### 获取 Supabase 配置信息：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 Settings > API
4. 复制 Project URL 和 anon public key

### 4. 部署配置

项目已包含 `vercel.json` 配置文件，包含以下优化：

- **构建配置**: 自动检测 Next.js 框架
- **区域设置**: 优化亚洲地区访问速度
- **安全头**: 添加安全相关的 HTTP 头
- **API 路由**: 配置 CORS 支持

### 5. 自动部署

配置完成后，Vercel 会自动：

1. 检测到 Next.js 项目
2. 安装依赖 (`npm install`)
3. 构建项目 (`npm run build`)
4. 部署到全球 CDN

### 6. 验证部署

部署完成后：

1. 访问 Vercel 提供的预览 URL
2. 测试用户注册和登录功能
3. 确认图片上传功能正常
4. 检查所有页面是否正常加载

## 环境变量说明

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | 存储桶名称 | ✅ |

## 常见问题

### 构建失败

1. 检查环境变量是否正确设置
2. 确认 Supabase 项目状态正常
3. 查看 Vercel 构建日志获取详细错误信息

### 认证问题

1. 确认 Supabase URL 和密钥正确
2. 检查 Supabase 项目的认证设置
3. 验证重定向 URL 配置

### 图片上传问题

1. 确认存储桶名称正确
2. 检查 Supabase 存储权限设置
3. 验证 RLS 策略配置

## 自定义域名

如需使用自定义域名：

1. 在 Vercel 项目设置中添加域名
2. 按照提示配置 DNS 记录
3. 等待 SSL 证书自动配置完成

## 监控和分析

建议启用：

- Vercel Analytics（网站性能分析）
- Vercel Speed Insights（页面加载性能）
- 错误监控服务（如 Sentry）

## 更新部署

每次推送到主分支时，Vercel 会自动重新部署。你也可以：

1. 在 Vercel Dashboard 手动触发部署
2. 使用 Vercel CLI 进行本地部署测试

## 支持

如遇到部署问题，请检查：

1. [Vercel 文档](https://vercel.com/docs)
2. [Next.js 部署指南](https://nextjs.org/docs/deployment)
3. [Supabase 文档](https://supabase.com/docs)