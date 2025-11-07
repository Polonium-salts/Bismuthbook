-- 创建搜索日志表
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  result_count INTEGER DEFAULT 0,
  filters JSONB DEFAULT '{}',
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_searched_at ON search_logs(searched_at DESC);

-- 创建热门搜索视图
CREATE OR REPLACE VIEW trending_searches AS
SELECT 
  query,
  COUNT(*) as search_count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(searched_at) as last_searched
FROM search_logs
WHERE searched_at > NOW() - INTERVAL '7 days'
GROUP BY query
ORDER BY search_count DESC
LIMIT 50;

-- 创建用户搜索历史视图
CREATE OR REPLACE VIEW user_search_history AS
SELECT 
  user_id,
  query,
  MAX(searched_at) as last_searched,
  COUNT(*) as search_count
FROM search_logs
WHERE user_id IS NOT NULL
GROUP BY user_id, query
ORDER BY last_searched DESC;

-- 添加 RLS 策略
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- 允许所有人插入搜索日志
CREATE POLICY "Anyone can insert search logs"
  ON search_logs
  FOR INSERT
  WITH CHECK (true);

-- 用户只能查看自己的搜索历史
CREATE POLICY "Users can view own search history"
  ON search_logs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- 创建函数：记录搜索
CREATE OR REPLACE FUNCTION log_search(
  p_query TEXT,
  p_result_count INTEGER DEFAULT 0,
  p_filters JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO search_logs (query, user_id, result_count, filters)
  VALUES (p_query, auth.uid(), p_result_count, p_filters)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 创建函数：获取热门搜索
CREATE OR REPLACE FUNCTION get_trending_searches(
  p_limit INTEGER DEFAULT 10,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  query TEXT,
  search_count BIGINT,
  unique_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.query,
    COUNT(*) as search_count,
    COUNT(DISTINCT sl.user_id) as unique_users
  FROM search_logs sl
  WHERE sl.searched_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY sl.query
  ORDER BY search_count DESC
  LIMIT p_limit;
END;
$$;

-- 创建函数：获取用户搜索历史
CREATE OR REPLACE FUNCTION get_user_search_history(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  query TEXT,
  last_searched TIMESTAMP WITH TIME ZONE,
  search_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.query,
    MAX(sl.searched_at) as last_searched,
    COUNT(*) as search_count
  FROM search_logs sl
  WHERE sl.user_id = COALESCE(p_user_id, auth.uid())
  GROUP BY sl.query
  ORDER BY last_searched DESC
  LIMIT p_limit;
END;
$$;

-- 添加注释
COMMENT ON TABLE search_logs IS '搜索日志表，记录用户的搜索行为';
COMMENT ON COLUMN search_logs.query IS '搜索关键词';
COMMENT ON COLUMN search_logs.user_id IS '用户ID（可为空，表示匿名搜索）';
COMMENT ON COLUMN search_logs.result_count IS '搜索结果数量';
COMMENT ON COLUMN search_logs.filters IS '搜索筛选条件（JSON格式）';
COMMENT ON COLUMN search_logs.searched_at IS '搜索时间';
