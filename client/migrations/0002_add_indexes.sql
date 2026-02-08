CREATE INDEX IF NOT EXISTS idx_dishes_updated_at ON dishes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_cooking_log_dish_id ON cooking_log(dish_id);
CREATE INDEX IF NOT EXISTS idx_cooking_log_cooked_at ON cooking_log(cooked_at DESC);
