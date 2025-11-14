-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'reply', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  actor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  actor_name TEXT,
  actor_avatar TEXT,
  image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- 启用 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许所有操作（开发/测试环境）
-- 注意：在生产环境中应该使用更严格的策略
CREATE POLICY "Allow all for testing"
  ON notifications
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 生产环境建议使用以下策略（注释掉的）：
-- CREATE POLICY "Users can view own notifications"
--   ON notifications FOR SELECT
--   TO public
--   USING (user_id IN (SELECT id FROM user_profiles WHERE id = auth.uid()));
--
-- CREATE POLICY "Anyone can insert notifications"
--   ON notifications FOR INSERT
--   TO public
--   WITH CHECK (true);
--
-- CREATE POLICY "Users can update own notifications"
--   ON notifications FOR UPDATE
--   TO public
--   USING (user_id IN (SELECT id FROM user_profiles WHERE id = auth.uid()));
--
-- CREATE POLICY "Users can delete own notifications"
--   ON notifications FOR DELETE
--   TO public
--   USING (user_id IN (SELECT id FROM user_profiles WHERE id = auth.uid()));

-- 添加注释
COMMENT ON TABLE notifications IS '用户通知表';
COMMENT ON COLUMN notifications.id IS '通知ID';
COMMENT ON COLUMN notifications.user_id IS '接收通知的用户ID';
COMMENT ON COLUMN notifications.type IS '通知类型：like, comment, follow, mention, reply, system';
COMMENT ON COLUMN notifications.title IS '通知标题';
COMMENT ON COLUMN notifications.message IS '通知内容';
COMMENT ON COLUMN notifications.link IS '通知链接';
COMMENT ON COLUMN notifications.read IS '是否已读';
COMMENT ON COLUMN notifications.actor_id IS '触发通知的用户ID';
COMMENT ON COLUMN notifications.actor_name IS '触发通知的用户名';
COMMENT ON COLUMN notifications.actor_avatar IS '触发通知的用户头像';
COMMENT ON COLUMN notifications.image_id IS '相关作品ID';
COMMENT ON COLUMN notifications.image_url IS '相关作品缩略图';
COMMENT ON COLUMN notifications.created_at IS '创建时间';
COMMENT ON COLUMN notifications.updated_at IS '更新时间';
