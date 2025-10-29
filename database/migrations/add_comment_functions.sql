-- 创建函数来增加评论数
CREATE OR REPLACE FUNCTION increment_comment_count(image_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE images 
  SET comment_count = comment_count + 1 
  WHERE id = image_id;
END;
$$ LANGUAGE plpgsql;

-- 创建函数来减少评论数
CREATE OR REPLACE FUNCTION decrement_comment_count(image_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE images 
  SET comment_count = GREATEST(comment_count - 1, 0) 
  WHERE id = image_id;
END;
$$ LANGUAGE plpgsql;

-- 添加评论相关的复合索引
CREATE INDEX IF NOT EXISTS idx_comments_image_user ON comments(image_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_created ON comments(user_id, created_at DESC);

-- 分析表以更新统计信息
ANALYZE comments;