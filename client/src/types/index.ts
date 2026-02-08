export interface Dish {
  id: number;
  name: string;
  category: string;
  difficulty: number;
  cooking_time: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  image?: string;
  tags: string[];
  tutorial_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DishFormData {
  name: string;
  category: string;
  difficulty: number;
  cooking_time: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  image?: string;
  tags: string[];
  tutorial_url?: string;
}

export interface CookingLog {
  id: number;
  dish_id: number;
  dish_name: string;
  dish_preview?: string;
  image_url?: string;
  notes?: string;
  cooked_at: string;
}

export interface CookingLogFormData {
  dish_id: number;
  image_url?: string;
  notes?: string;
}

export interface AdminStats {
  total_dishes: number;
  total_categories: number;
  total_logs: number;
  last_updated: string | null;
}

export interface BackupExportResult {
  blob: Blob;
  filename: string;
}

export interface ApiHealth {
  status: string;
  service?: string;
  runtime?: string;
  timestamp?: string;
}
