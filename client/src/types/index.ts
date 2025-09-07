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
