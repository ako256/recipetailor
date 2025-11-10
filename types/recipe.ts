export interface RecipeStep {
  title: string
  description: string
  tools?: string[]
  duration?: number
}

export interface NutritionInfo {
  calories_per_serving: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  servings: number
}

export interface Recipe {
  title: string
  description: string
  ingredients: string[]
  steps: RecipeStep[]
  nutrition?: NutritionInfo
}

export interface RecipeRating {
  id: string
  rating: number
  review?: string
  user_id: string
  created_at: string
}

export interface RecipeRatingData {
  id: string
  rating: number
  review?: string
  user_id: string
  created_at: string
}

export interface MealPlan {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}
