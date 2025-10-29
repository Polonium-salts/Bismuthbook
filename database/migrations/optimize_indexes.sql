-- Performance optimization indexes for Bismuthbook
-- This migration adds indexes to improve query performance

-- Index for published images (most common filter)
CREATE INDEX IF NOT EXISTS idx_images_published ON images(is_published) WHERE is_published = true;

-- Composite index for published images with created_at for recent queries
CREATE INDEX IF NOT EXISTS idx_images_published_created_at ON images(is_published, created_at DESC) WHERE is_published = true;

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category) WHERE category IS NOT NULL;

-- Composite index for category and published status
CREATE INDEX IF NOT EXISTS idx_images_category_published ON images(category, is_published, created_at DESC) WHERE is_published = true AND category IS NOT NULL;

-- Index for user_id (for user's own images)
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);

-- Composite index for user images with published status
CREATE INDEX IF NOT EXISTS idx_images_user_published ON images(user_id, is_published, created_at DESC);

-- Index for like_count (for popular sorting)
CREATE INDEX IF NOT EXISTS idx_images_like_count ON images(like_count DESC) WHERE is_published = true;

-- Index for view_count (for popular sorting)
CREATE INDEX IF NOT EXISTS idx_images_view_count ON images(view_count DESC) WHERE is_published = true;

-- Composite index for popularity sorting
CREATE INDEX IF NOT EXISTS idx_images_popularity ON images(is_published, like_count DESC, view_count DESC, comment_count DESC) WHERE is_published = true;

-- GIN index for tags array (for tag filtering)
CREATE INDEX IF NOT EXISTS idx_images_tags ON images USING GIN(tags) WHERE tags IS NOT NULL;

-- Index for likes table (user interactions)
CREATE INDEX IF NOT EXISTS idx_likes_user_image ON likes(user_id, image_id);
CREATE INDEX IF NOT EXISTS idx_likes_image_user ON likes(image_id, user_id);

-- Index for favorites table (user interactions)
CREATE INDEX IF NOT EXISTS idx_favorites_user_image ON favorites(user_id, image_id);
CREATE INDEX IF NOT EXISTS idx_favorites_image_user ON favorites(image_id, user_id);

-- Index for comments (if exists)
CREATE INDEX IF NOT EXISTS idx_comments_image_id ON comments(image_id) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments');

-- Index for follows table (if exists)
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows');
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows');

-- Partial index for featured images
CREATE INDEX IF NOT EXISTS idx_images_featured ON images(is_featured, created_at DESC) WHERE is_featured = true AND is_published = true;

-- Index for user profiles username (for user lookup)
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Analyze tables to update statistics
ANALYZE images;
ANALYZE likes;
ANALYZE favorites;
ANALYZE user_profiles;

-- Add comments for documentation
COMMENT ON INDEX idx_images_published IS 'Optimizes queries filtering by published status';
COMMENT ON INDEX idx_images_published_created_at IS 'Optimizes recent published images queries';
COMMENT ON INDEX idx_images_category_published IS 'Optimizes category filtering with published status';
COMMENT ON INDEX idx_images_popularity IS 'Optimizes popular images sorting';
COMMENT ON INDEX idx_images_tags IS 'Optimizes tag-based filtering using GIN index';