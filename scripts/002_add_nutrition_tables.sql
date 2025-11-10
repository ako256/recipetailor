-- Create nutrition_info table
CREATE TABLE IF NOT EXISTS public.nutrition_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  calories_per_serving INTEGER,
  protein_g DECIMAL(5,2),
  carbs_g DECIMAL(5,2),
  fat_g DECIMAL(5,2),
  fiber_g DECIMAL(5,2),
  servings INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.nutrition_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutrition_info_select" ON public.nutrition_info FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = nutrition_info.recipe_id
    AND (recipes.user_id = auth.uid() OR recipes.is_published = TRUE)
  )
);
CREATE POLICY "nutrition_info_insert" ON public.nutrition_info FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = nutrition_info.recipe_id
    AND recipes.user_id = auth.uid()
  )
);
CREATE POLICY "nutrition_info_update" ON public.nutrition_info FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = nutrition_info.recipe_id
    AND recipes.user_id = auth.uid()
  )
);
CREATE POLICY "nutrition_info_delete" ON public.nutrition_info FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = nutrition_info.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Create recipe_ratings table
CREATE TABLE IF NOT EXISTS public.recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_ratings_select" ON public.recipe_ratings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_ratings.recipe_id
    AND (recipes.user_id = auth.uid() OR recipes.is_published = TRUE)
  )
);
CREATE POLICY "recipe_ratings_insert" ON public.recipe_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipe_ratings_update" ON public.recipe_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "recipe_ratings_delete" ON public.recipe_ratings FOR DELETE USING (auth.uid() = user_id);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_plans_select_own" ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meal_plans_insert_own" ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meal_plans_update_own" ON public.meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "meal_plans_delete_own" ON public.meal_plans FOR DELETE USING (auth.uid() = user_id);

-- Create meal_plan_items table
CREATE TABLE IF NOT EXISTS public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_plan_items_select" ON public.meal_plan_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans
    WHERE meal_plans.id = meal_plan_items.meal_plan_id
    AND meal_plans.user_id = auth.uid()
  )
);
CREATE POLICY "meal_plan_items_insert" ON public.meal_plan_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meal_plans
    WHERE meal_plans.id = meal_plan_items.meal_plan_id
    AND meal_plans.user_id = auth.uid()
  )
);
CREATE POLICY "meal_plan_items_delete" ON public.meal_plan_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans
    WHERE meal_plans.id = meal_plan_items.meal_plan_id
    AND meal_plans.user_id = auth.uid()
  )
);

-- Add column to profiles for tracking dietary restrictions and preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allergies TEXT[];
