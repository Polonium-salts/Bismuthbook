# 搜索功能实现指南

## 📋 目录

1. [功能概述](#功能概述)
2. [文件结构](#文件结构)
3. [核心组件](#核心组件)
4. [数据库设计](#数据库设计)
5. [API 路由](#api-路由)
6. [使用示例](#使用示例)
7. [安装依赖](#安装依赖)
8. [部署步骤](#部署步骤)

## 功能概述

本项目实现了一个完整的 YouTube 风格搜索系统，包括：

### ✨ 核心功能

- **搜索页面** (`/search`)
  - URL 参数支持 (`?q=关键词`)
  - 实时搜索结果
  - 响应式设计

- **搜索筛选**
  - 排序：上传日期、观看次数、点赞数、热门程度
  - 时间范围：最近一小时、今天、本周、本月、今年
  - 分类筛选
  - 标签筛选
  - 互动数据筛选（最小点赞数、最小浏览数）

- **搜索建议**
  - 实时搜索建议
  - 搜索历史记录
  - 热门搜索推荐
  - 防抖优化

- **搜索分析**
  - 搜索日志记录
  - 热门搜索统计
  - 用户搜索历史

## 文件结构

```
app/
├── search/
│   └── page.tsx                          # 搜索页面
├── api/
│   └── search/
│       ├── suggestions/
│       │   └── route.ts                  # 搜索建议 API
│       └── trending/
│           └── route.ts                  # 热门搜索 API

components/
├── search/
│   ├── index.ts                          # 导出索引
│   ├── search-bar.tsx                    # 基础搜索栏
│   ├── search-filters.tsx                # 基础筛选器
│   ├── youtube-search-filters.tsx        # YouTube 风格筛选器
│   ├── youtube-search-results.tsx        # YouTube 风格搜索结果
│   ├── youtube-style-search-bar.tsx      # YouTube 风格搜索栏
│   ├── enhanced-search-bar.tsx           # 增强搜索栏（带建议）
│   ├── search-suggestions.tsx            # 搜索建议组件
│   ├── search-empty-state.tsx            # 空状态组件
│   ├── search-stats.tsx                  # 搜索统计组件
│   ├── trending-searches.tsx             # 热门搜索组件
│   ├── search-history-panel.tsx          # 搜索历史面板
│   └── search-filters-sidebar.tsx        # 侧边栏筛选器
└── ui/
    ├── slider.tsx                        # 滑块组件
    └── alert-dialog.tsx                  # 警告对话框组件

hooks/
├── use-search-history.ts                 # 搜索历史 Hook
└── use-debounce.ts                       # 防抖 Hook

lib/
└── utils/
    └── search-utils.ts                   # 搜索工具函数

supabase/
└── migrations/
    └── 20240107_create_search_logs.sql   # 数据库迁移文件

docs/
├── SEARCH_FEATURE.md                     # 功能文档
├── USAGE_EXAMPLES.md                     # 使用示例
└── SEARCH_IMPLEMENTATION_GUIDE.md        # 实现指南（本文件）
```

## 核心组件

### 1. 搜索页面 (`app/search/page.tsx`)

主搜索页面，整合所有搜索功能。

**特性：**
- URL 参数同步
- 搜索历史记录
- 空状态处理
- 错误处理
- 加载状态

### 2. YouTube 风格筛选器 (`youtube-search-filters.tsx`)

**特性：**
- 圆角按钮设计
- 下拉菜单选择
- 筛选徽章显示
- 移动端 Sheet 支持

### 3. YouTube 风格搜索结果 (`youtube-search-results.tsx`)

**特性：**
- 列表视图（默认）
- 网格视图（可选）
- 缩略图预览
- 作者信息
- 互动数据显示

### 4. 增强搜索栏 (`enhanced-search-bar.tsx`)

**特性：**
- 实时搜索建议
- 搜索历史
- 防抖优化
- 加载指示器
- 清除按钮

### 5. 搜索建议 (`search-suggestions.tsx`)

**特性：**
- 关键词建议
- 标签建议
- 艺术家建议
- 最近搜索
- 热门搜索

## 数据库设计

### search_logs 表

```sql
CREATE TABLE search_logs (
  id UUID PRIMARY KEY,
  query TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  result_count INTEGER DEFAULT 0,
  filters JSONB DEFAULT '{}',
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**索引：**
- `idx_search_logs_query` - 查询关键词索引
- `idx_search_logs_user_id` - 用户 ID 索引
- `idx_search_logs_searched_at` - 搜索时间索引

**视图：**
- `trending_searches` - 热门搜索视图
- `user_search_history` - 用户搜索历史视图

**函数：**
- `log_search()` - 记录搜索
- `get_trending_searches()` - 获取热门搜索
- `get_user_search_history()` - 获取用户搜索历史

## API 路由

### 1. 搜索建议 API

**端点：** `GET /api/search/suggestions?q=关键词`

**响应：**
```json
{
  "suggestions": [
    {
      "type": "tag",
      "text": "动漫",
      "count": 1234
    }
  ]
}
```

### 2. 热门搜索 API

**端点：** `GET /api/search/trending`

**响应：**
```json
{
  "trending": [
    {
      "query": "动漫少女",
      "count": 1234
    }
  ]
}
```

**端点：** `POST /api/search/trending`

**请求体：**
```json
{
  "query": "搜索关键词"
}
```

## 使用示例

### 基本搜索

```tsx
import { EnhancedSearchBar } from "@/components/search"

export default function Page() {
  return (
    <EnhancedSearchBar
      placeholder="搜索作品..."
      showSuggestions={true}
    />
  )
}
```

### 带筛选器的搜索

```tsx
import { 
  YouTubeSearchFilters, 
  YouTubeSearchResults 
} from "@/components/search"

export default function SearchPage() {
  const [sortBy, setSortBy] = useState('created_at')
  const [results, setResults] = useState([])

  return (
    <>
      <YouTubeSearchFilters
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <YouTubeSearchResults results={results} />
    </>
  )
}
```

### 搜索历史

```tsx
import { useSearchHistory } from "@/hooks/use-search-history"

export default function Component() {
  const { history, addToHistory, clearHistory } = useSearchHistory()

  const handleSearch = (query: string) => {
    addToHistory(query)
    // 执行搜索...
  }

  return (
    <div>
      {history.map(query => (
        <div key={query}>{query}</div>
      ))}
    </div>
  )
}
```

## 安装依赖

### 必需的 npm 包

```bash
# 如果缺少以下包，请安装：
npm install @radix-ui/react-slider
npm install @radix-ui/react-alert-dialog
```

### 已包含的依赖

- `@radix-ui/react-popover` ✅
- `@radix-ui/react-dropdown-menu` ✅
- `@radix-ui/react-dialog` ✅
- `cmdk` ✅
- `lucide-react` ✅

## 部署步骤

### 1. 数据库迁移

```bash
# 运行迁移文件
supabase migration up
```

或者在 Supabase Dashboard 中执行 SQL：

```sql
-- 复制 supabase/migrations/20240107_create_search_logs.sql 的内容
```

### 2. 环境变量

确保 `.env.local` 包含：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 构建项目

```bash
npm run build
```

### 4. 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
npm run start
```

## 工具函数

### 搜索工具 (`lib/utils/search-utils.ts`)

```typescript
// 高亮搜索关键词
highlightSearchQuery(text, query)

// 解析搜索查询
parseSearchQuery(query)

// 构建搜索 URL
buildSearchUrl({ query, tags, category })

// 计算相关性得分
calculateRelevanceScore(item, query)

// 格式化结果数量
formatResultCount(count)

// 验证搜索查询
isValidSearchQuery(query)

// 清理搜索查询
sanitizeSearchQuery(query)

// 排序搜索结果
sortSearchResults(results, sortBy)
```

## 性能优化

### 1. 防抖搜索

使用 `useDebounce` Hook 减少 API 调用：

```typescript
const debouncedQuery = useDebounce(query, 300)
```

### 2. 缓存搜索结果

使用 React Query 或 SWR 缓存搜索结果。

### 3. 懒加载

使用 Next.js Image 组件和分页加载。

### 4. 索引优化

确保数据库表有适当的索引。

## 未来改进

- [ ] 搜索结果高亮关键词
- [ ] 语音搜索功能
- [ ] 搜索结果导出
- [ ] 高级搜索语法（AND、OR、NOT）
- [ ] 搜索结果分面导航
- [ ] 搜索推荐算法优化
- [ ] 搜索分析仪表板
- [ ] A/B 测试搜索体验

## 故障排除

### 问题：搜索建议不显示

**解决方案：**
1. 检查 API 路由是否正常
2. 检查网络请求
3. 查看浏览器控制台错误

### 问题：搜索历史不保存

**解决方案：**
1. 检查 localStorage 是否可用
2. 检查浏览器隐私设置
3. 清除浏览器缓存

### 问题：筛选器不工作

**解决方案：**
1. 检查状态管理
2. 检查 URL 参数同步
3. 查看组件 props 传递

## 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Radix UI 文档](https://www.radix-ui.com/)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

## 支持

如有问题，请查看：
- `docs/SEARCH_FEATURE.md` - 功能文档
- `docs/USAGE_EXAMPLES.md` - 使用示例
