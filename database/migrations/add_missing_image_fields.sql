-- 添加 images 表缺失的字段
-- 这些字段在代码中被使用但在初始化脚本中缺失

-- 添加 is_published 字段
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 添加 updated_at 字段
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 为 updated_at 字段创建触发器
CREATE TRIGGER update_images_updated_at 
  BEFORE UPDATE ON images 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_images_is_published ON images(is_published);
CREATE INDEX IF NOT EXISTS idx_images_updated_at ON images(updated_at DESC);

-- 更新现有记录的 is_published 字段为 true（如果为 NULL）
UPDATE images SET is_published = true WHERE is_published IS NULL;

-- 更新现有记录的 updated_at 字段为 created_at（如果为 NULL）
UPDATE images SET updated_at = created_at WHERE updated_at IS NULL;

-- 添加注释
COMMENT ON COLUMN images.is_published IS '图片是否已发布';
COMMENT ON COLUMN images.updated_at IS '图片最后更新时间';