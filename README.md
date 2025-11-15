# BismuthBook - 图片分享社区

一个美丽的图片分享和发现平台，采用 Next.js 15 构建，支持完整的移动端和桌面端体验。

## ✨ 特性

- 🎨 **精美的UI设计** - Pixiv风格的现代化界面
- 📱 **移动端优化** - 完整的移动端底部导航栏和响应式布局
- 🌓 **深色模式** - 自动适配系统主题
- 🔍 **强大的搜索** - YouTube风格的搜索体验
- 💖 **社交功能** - 关注、收藏、评论、点赞
- 🔔 **实时通知** - 即时的互动通知
- 🖼️ **作品管理** - 上传、编辑、分类管理
- 👤 **用户系统** - 完整的认证和个人资料

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.local.example` 到 `.env.local` 并填入你的配置：

```bash
cp .env.local.example .env.local
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 移动端测试

1. 打开浏览器开发者工具 (F12)
2. 切换到移动设备模式 (Ctrl+Shift+M / Cmd+Shift+M)
3. 选择设备型号（推荐 iPhone 14 Pro）
4. 体验移动端底部导航栏

详细的移动端测试指南请查看 [MOBILE_TESTING_GUIDE.md](./MOBILE_TESTING_GUIDE.md)

## 📱 移动端优化

本项目包含完整的移动端UI优化和响应式设计：

### 核心特性
- **底部导航栏** - 固定在屏幕底部，包含5个主要导航项（移动端唯一导航方式）⭐
- **响应式布局** - 6个断点（xs-2xl）自动适配所有屏幕尺寸
- **触摸优化** - 符合 44x44px 最小触摸目标，流畅的交互体验
- **安全区域适配** - 完美支持刘海屏、药丸屏等特殊屏幕
- **横屏优化** - 自动调整布局适配横屏模式
- **性能优化** - 防抖处理、条件渲染、GPU 加速

### 最新更新 ⭐
- **v2.1.0**: 移动端完全移除侧边栏抽屉，统一使用底部导航栏
- 桌面端布局保持不变，继续使用侧边栏导航

### 响应式断点
```
xs:   375px  (小手机)
sm:   640px  (大手机)
md:   768px  (平板竖屏)
lg:   1024px (平板横屏/笔记本)
xl:   1280px (桌面)
2xl:  1536px (2K屏幕)
```

### 文档
- [快速入门](./MOBILE_QUICKSTART.md) - 快速上手移动端功能
- [快速参考](./RESPONSIVE_QUICK_REFERENCE.md) - 响应式速查表
- [移动端优化](./MOBILE_OPTIMIZATION.md) - 移动端详细说明
- [响应式优化](./RESPONSIVE_OPTIMIZATION.md) - 响应式设计文档
- [导航优化](./MOBILE_NAVIGATION_UPDATE.md) - 移动端导航更新 ⭐ 最新
- [优化对比](./BEFORE_AFTER_COMPARISON.md) - 优化前后对比
- [测试指南](./MOBILE_TESTING_GUIDE.md) - 完整的测试流程
- [总结](./MOBILE_SUMMARY.md) - 完整总结

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **UI库**: React 19
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion
- **数据库**: Supabase
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **类型**: TypeScript
- **图标**: Lucide React

## 📂 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── artwork/           # 作品详情页
│   ├── profile/           # 个人资料页
│   └── ...
├── components/            # React 组件
│   ├── layout/           # 布局组件（包含移动端导航）
│   ├── artwork/          # 作品相关组件
│   ├── auth/             # 认证组件
│   └── ...
├── lib/                   # 工具函数和配置
│   ├── config/           # 配置文件（包含移动端导航配置）
│   ├── providers/        # Context Providers
│   ├── services/         # 业务逻辑服务
│   └── utils/            # 工具函数
├── hooks/                 # 自定义 React Hooks
├── public/               # 静态资源
└── database/             # 数据库迁移文件
```

## 🎨 自定义配置

### 修改移动端导航

编辑 `lib/config/mobile-nav-config.ts` 来自定义底部导航栏：

```typescript
export const defaultMobileNavItems: MobileNavItem[] = [
  { icon: Home, label: "首页", href: "/" },
  { icon: Heart, label: "关注", href: "/following" },
  { icon: Plus, label: "发布", href: "/upload", isSpecial: true },
  { icon: Bookmark, label: "收藏", href: "/bookmarks" },
  { icon: User, label: "我的", href: "/profile" },
]
```

### 修改主题

编辑 `app/globals.css` 中的 CSS 变量来自定义主题颜色。

## 📖 文档

- [移动端快速入门](./MOBILE_QUICKSTART.md) - 快速上手移动端功能
- [移动端优化说明](./MOBILE_OPTIMIZATION.md) - 详细的技术说明
- [移动端测试指南](./MOBILE_TESTING_GUIDE.md) - 完整的测试流程
- [更改总结](./MOBILE_UI_CHANGES.md) - 所有文件更改清单

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
