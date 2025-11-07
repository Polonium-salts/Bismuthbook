# 🔍 YouTube 风格搜索功能

一个完整的、现代化的搜索系统，仿照 YouTube 的设计风格，为图片分享平台提供强大的搜索体验。

## ✨ 功能特性

### 🎯 核心功能

- ✅ **智能搜索栏** - 实时建议、搜索历史、防抖优化
- ✅ **高级筛选** - 分类、标签、时间范围、互动数据
- ✅ **多种排序** - 时间、热度、点赞、浏览
- ✅ **搜索历史** - 本地存储、快速访问
- ✅ **热门搜索** - 实时统计、趋势分析
- ✅ **响应式设计** - 完美适配移动端和桌面端
- ✅ **空状态处理** - 友好的提示和引导
- ✅ **搜索分析** - 日志记录、数据统计

### 🎨 设计特点

- **YouTube 风格** - 圆角按钮、下拉菜单、筛选徽章
- **流畅动画** - 平滑过渡、悬停效果
- **直观交互** - 清晰的视觉反馈
- **现代 UI** - 使用 Shadcn/ui 组件库

## 📦 已创建的文件

### 页面和路由
```
✅ app/search/page.tsx                    # 搜索页面
✅ app/api/search/suggestions/route.ts    # 搜索建议 API
✅ app/api/search/trending/route.ts       # 热门搜索 API
```

### 搜索组件
```
✅ components/search/youtube-search-filters.tsx      # YouTube 风格筛选器
✅ components/search/youtube-search-results.tsx      # YouTube 风格搜索结果
✅ components/search/youtube-style-search-bar.tsx    # YouTube 风格搜索栏
✅ components/search/enhanced-search-bar.tsx         # 增强搜索栏
✅ components/search/search-suggestions.tsx          # 搜索建议
✅ components/search/search-empty-state.tsx          # 空状态组件
✅ components/search/search-stats.tsx                # 搜索统计
✅ components/search/trending-searches.tsx           # 热门搜索
✅ components/search/search-history-panel.tsx        # 搜索历史面板
✅ components/search/search-filters-sidebar.tsx      # 侧边栏筛选器
✅ components/search/index.ts                        # 导出索引
```

### UI 组件
```
✅ components/ui/slider.tsx              # 滑块组件
✅ components/ui/alert-dialog.tsx        # 警告对话框
```

### Hooks
```
✅ hooks/use-search-history.ts           # 搜索历史管理
✅ hooks/use-debounce.ts                 # 防抖优化
```

### 工具函数
```
✅ lib/utils/search-utils.ts             # 搜索工具函数
```

### 数据库
```
✅ supabase/migrations/20240107_create_search_logs.sql  # 搜索日志表
```

### 文档
```
✅ docs/SEARCH_FEATURE.md                # 功能文档
✅ docs/USAGE_EXAMPLES.md                # 使用示例
✅ docs/SEARCH_IMPLEMENTATION_GUIDE.md   # 实现指南
✅ README_SEARCH.md                      # 本文件
```

### 样式
```
✅ app/globals.css                       # 全局样式（已更新）
```

### 布局
```
✅ components/layout/header.tsx          # 头部组件（已更新）
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装缺失的依赖（如果需要）
npm install @radix-ui/react-slider @radix-ui/react-alert-dialog
```

### 2. 运行数据库迁移

```bash
# 使用 Supabase CLI
supabase migration up

# 或者在 Supabase Dashboard 中执行
# supabase/migrations/20240107_create_search_logs.sql
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问搜索页面

打开浏览器访问：
- 搜索页面：`http://localhost:3000/search`
- 带查询：`http://localhost:3000/search?q=动漫`

## 📖 使用指南

### 基本搜索

在任何页面的头部搜索栏输入关键词，按 Enter 键即可跳转到搜索页面。

### 高级筛选

1. 点击"筛选器"按钮
2. 选择分类和标签
3. 调整排序方式和时间范围
4. 结果自动更新

### 搜索历史

- 自动保存最近 10 次搜索
- 点击历史记录快速搜索
- 可以删除单个或清空全部

### 热门搜索

- 查看当前热门搜索词
- 点击快速搜索
- 实时更新趋势

## 🎯 组件使用

### 增强搜索栏

```tsx
import { EnhancedSearchBar } from "@/components/search"

<EnhancedSearchBar
  placeholder="搜索作品..."
  showSuggestions={true}
  autoFocus={false}
/>
```

### YouTube 风格筛选器

```tsx
import { YouTubeSearchFilters } from "@/components/search"

<YouTubeSearchFilters
  sortBy={sortBy}
  timeRange={timeRange}
  selectedCategories={selectedCategories}
  selectedTags={selectedTags}
  categories={categories}
  popularTags={popularTags}
  onSortChange={handleSortChange}
  onTimeRangeChange={handleTimeRangeChange}
  onCategoryToggle={handleCategoryToggle}
  onTagToggle={handleTagToggle}
  onClearFilters={handleClearFilters}
/>
```

### YouTube 风格搜索结果

```tsx
import { YouTubeSearchResults } from "@/components/search"

<YouTubeSearchResults
  results={searchResults}
  onLoadMore={loadMore}
  hasMore={hasMore}
  isLoading={isLoading}
/>
```

### 搜索历史

```tsx
import { useSearchHistory } from "@/hooks/use-search-history"

const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory()
```

## 🛠️ 工具函数

```typescript
import {
  highlightSearchQuery,      // 高亮关键词
  parseSearchQuery,          // 解析查询
  buildSearchUrl,            // 构建 URL
  calculateRelevanceScore,   // 计算相关性
  formatResultCount,         // 格式化数量
  isValidSearchQuery,        // 验证查询
  sanitizeSearchQuery,       // 清理查询
  sortSearchResults          // 排序结果
} from "@/lib/utils/search-utils"
```

## 📊 数据库结构

### search_logs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| query | TEXT | 搜索关键词 |
| user_id | UUID | 用户 ID（可为空） |
| result_count | INTEGER | 结果数量 |
| filters | JSONB | 筛选条件 |
| searched_at | TIMESTAMP | 搜索时间 |

### 视图和函数

- `trending_searches` - 热门搜索视图
- `user_search_history` - 用户搜索历史视图
- `log_search()` - 记录搜索函数
- `get_trending_searches()` - 获取热门搜索
- `get_user_search_history()` - 获取用户历史

## 🎨 样式定制

### 自定义颜色

在 `app/globals.css` 中修改：

```css
/* 搜索相关颜色 */
--search-primary: oklch(0.646 0.222 41.116);
--search-hover: oklch(0.6 0.118 184.704);
```

### 自定义动画

```css
/* 搜索动画 */
.search-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

## 📱 响应式设计

- **移动端**：使用 Sheet 组件显示筛选器
- **平板**：优化布局和间距
- **桌面**：完整功能和侧边栏

## ⚡ 性能优化

- ✅ 防抖搜索（300ms）
- ✅ 懒加载图片
- ✅ 分页加载结果
- ✅ 缓存搜索建议
- ✅ 数据库索引优化

## 🔒 安全性

- ✅ SQL 注入防护
- ✅ XSS 防护
- ✅ 输入验证和清理
- ✅ RLS 策略保护

## 🐛 故障排除

### 搜索建议不显示

1. 检查 API 路由：`/api/search/suggestions`
2. 查看浏览器控制台错误
3. 确认网络请求成功

### 搜索历史不保存

1. 检查 localStorage 是否可用
2. 查看浏览器隐私设置
3. 清除浏览器缓存后重试

### 筛选器不工作

1. 检查状态管理逻辑
2. 确认 props 正确传递
3. 查看 URL 参数是否同步

## 📚 相关文档

- [功能文档](docs/SEARCH_FEATURE.md) - 详细功能说明
- [使用示例](docs/USAGE_EXAMPLES.md) - 代码示例
- [实现指南](docs/SEARCH_IMPLEMENTATION_GUIDE.md) - 完整实现指南

## 🎯 下一步

### 建议的改进

1. **搜索结果高亮** - 在结果中高亮显示关键词
2. **语音搜索** - 添加语音输入功能
3. **搜索推荐** - 基于用户行为的智能推荐
4. **高级语法** - 支持 AND、OR、NOT 等操作符
5. **搜索分析** - 管理员仪表板和数据分析
6. **A/B 测试** - 测试不同的搜索体验

### 可选功能

- [ ] 搜索结果导出
- [ ] 保存搜索条件
- [ ] 搜索提醒
- [ ] 相关搜索推荐
- [ ] 搜索结果分享

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**创建时间：** 2024年1月7日  
**版本：** 1.0.0  
**作者：** Kiro AI Assistant

🎉 **搜索功能已完成！** 现在你可以开始使用这个强大的搜索系统了。
