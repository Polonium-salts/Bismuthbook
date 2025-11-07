# YouTube 风格搜索功能

## 概述

本项目实现了一个仿照 YouTube 风格的搜索功能和搜索结果页面，提供直观、流畅的搜索体验。

## 功能特性

### 1. 搜索页面 (`/search`)

- **URL 参数支持**：通过 `?q=关键词` 进行搜索
- **实时搜索结果**：根据关键词动态加载作品
- **响应式设计**：适配移动端和桌面端

### 2. YouTube 风格筛选器

#### 排序选项
- 上传日期（最新优先）
- 观看次数（最多优先）
- 点赞数（最多优先）
- 热门程度（综合排序）

#### 时间范围
- 不限时间
- 最近一小时
- 今天
- 本周
- 本月
- 今年

#### 高级筛选
- **分类筛选**：按作品分类过滤
- **标签筛选**：按热门标签过滤
- **筛选器徽章**：显示已选筛选条件
- **一键清除**：快速清除所有筛选

### 3. 搜索结果展示

#### 列表视图（默认）
- **缩略图**：240x144px 的作品预览
- **标题和描述**：清晰展示作品信息
- **作者信息**：头像和用户名
- **元数据**：观看次数、点赞数、发布时间
- **标签和分类**：快速识别作品类型
- **更多选项**：分享、收藏、举报等操作

#### 网格视图（可选）
- 紧凑的卡片布局
- 适合快速浏览大量作品

### 4. 头部搜索栏

- **全局搜索**：在任何页面都可以使用
- **Enter 键搜索**：快速提交搜索
- **自动导航**：搜索后跳转到搜索页面

## 文件结构

```
app/
  search/
    page.tsx                          # 搜索页面主组件

components/
  search/
    search-bar.tsx                    # 原有搜索栏（带建议）
    search-filters.tsx                # 原有筛选器
    youtube-search-filters.tsx        # YouTube 风格筛选器
    youtube-search-results.tsx        # YouTube 风格搜索结果
    youtube-style-search-bar.tsx      # YouTube 风格搜索栏

  layout/
    header.tsx                        # 更新后的头部（支持搜索）
```

## 使用方法

### 基本搜索

1. 在头部搜索栏输入关键词
2. 按 Enter 键或点击搜索按钮
3. 自动跳转到搜索结果页面

### 高级筛选

1. 在搜索页面点击"筛选器"按钮
2. 选择分类和标签
3. 调整排序方式和时间范围
4. 结果自动更新

### URL 直接访问

```
/search?q=动漫少女
/search?q=风景画
```

## 技术实现

### 核心技术栈

- **Next.js 14**：App Router
- **React 18**：Hooks（useState, useCallback, useEffect）
- **TypeScript**：类型安全
- **Tailwind CSS**：样式系统
- **Shadcn/ui**：UI 组件库

### 关键组件

#### YouTubeSearchFilters

```tsx
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

#### YouTubeSearchResults

```tsx
<YouTubeSearchResults
  results={searchResults}
  onLoadMore={hasMore ? loadMore : undefined}
  hasMore={hasMore}
  isLoading={isLoading}
/>
```

### 数据流

1. 用户输入搜索关键词
2. URL 参数更新（`?q=关键词`）
3. `useImages` Hook 获取搜索结果
4. 结果渲染到页面
5. 用户调整筛选器
6. 重新获取并更新结果

## 样式特点

### YouTube 风格设计

- **圆角按钮**：使用 `rounded-full` 实现药丸形状
- **下拉菜单**：清晰的选项列表和选中状态
- **筛选徽章**：彩色标签显示已选条件
- **悬停效果**：平滑的过渡动画
- **响应式布局**：移动端使用 Sheet，桌面端使用 Dropdown

### 自定义样式

```css
/* 隐藏滚动条 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 网格背景 */
.bg-grid-pattern {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

## 性能优化

1. **懒加载**：使用 Next.js Image 组件
2. **分页加载**："加载更多"按钮
3. **防抖搜索**：避免频繁请求
4. **缓存结果**：使用 React Query 或 SWR

## 未来改进

- [ ] 搜索历史记录持久化
- [ ] 搜索建议自动完成
- [ ] 语音搜索功能
- [ ] 搜索结果高亮关键词
- [ ] 保存搜索筛选器预设
- [ ] 搜索分析和推荐
- [ ] 无限滚动加载

## 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Shadcn/ui 组件](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
