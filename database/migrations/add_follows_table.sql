-- 创建关注表
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- 防止用户关注自己
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- 启用行级安全策略
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 关注策略
CREATE POLICY "所有人可以查看关注关系" ON follows
  FOR SELECT USING (true);

CREATE POLICY "认证用户可以关注他人" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "用户只能删除自己的关注" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- 创建函数来获取用户的关注者数量
CREATE OR REPLACE FUNCTION get_followers_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM follows
    WHERE following_id = user_id
  );
END;
$$ LANGUAGE plpgsql;

-- 创建函数来获取用户的关注数量
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM follows
    WHERE follower_id = user_id
  );
END;
$$ LANGUAGE plpgsql;

-- 创建函数来检查关注状态
CREATE OR REPLACE FUNCTION is_following(follower_id UUID, following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM follows
    WHERE follower_id = is_following.follower_id 
    AND following_id = is_following.following_id
  );
END;
$$ LANGUAGE plpgsql;