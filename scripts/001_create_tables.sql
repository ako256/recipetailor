-- Create profiles table for user preferences
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  vegetarian BOOLEAN DEFAULT FALSE,
  vegan BOOLEAN DEFAULT FALSE,
  gluten_free BOOLEAN DEFAULT FALSE,
  dairy_free BOOLEAN DEFAULT FALSE,
  nut_free BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_select_own_or_published" ON public.recipes FOR SELECT USING (
  auth.uid() = user_id OR is_published = TRUE
);
CREATE POLICY "recipes_insert_own" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_update_own" ON public.recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "recipes_delete_own" ON public.recipes FOR DELETE USING (auth.uid() = user_id);

-- Create recipe steps table
CREATE TABLE IF NOT EXISTS public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_steps_select" ON public.recipe_steps FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_steps.recipe_id
    AND (recipes.user_id = auth.uid() OR recipes.is_published = TRUE)
  )
);
CREATE POLICY "recipe_steps_insert" ON public.recipe_steps FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_steps.recipe_id
    AND recipes.user_id = auth.uid()
  )
);
CREATE POLICY "recipe_steps_update" ON public.recipe_steps FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_steps.recipe_id
    AND recipes.user_id = auth.uid()
  )
);
CREATE POLICY "recipe_steps_delete" ON public.recipe_steps FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_steps.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Create step tools table
CREATE TABLE IF NOT EXISTS public.step_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES public.recipe_steps(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.step_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "step_tools_select" ON public.step_tools FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.recipe_steps
    JOIN public.recipes ON recipes.id = recipe_steps.recipe_id
    WHERE recipe_steps.id = step_tools.step_id
    AND (recipes.user_id = auth.uid() OR recipes.is_published = TRUE)
  )
);
CREATE POLICY "step_tools_insert" ON public.step_tools FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipe_steps
    JOIN public.recipes ON recipes.id = recipe_steps.recipe_id
    WHERE recipe_steps.id = step_tools.step_id
    AND recipes.user_id = auth.uid()
  )
);
CREATE POLICY "step_tools_update" ON public.step_tools FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.recipe_steps
    JOIN public.recipes ON recipes.id = recipe_steps.recipe_id
    WHERE recipe_steps.id = step_tools.step_id
    AND recipes.user_id = auth.uid()
  )
);
CREATE POLICY "step_tools_delete" ON public.step_tools FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.recipe_steps
    JOIN public.recipes ON recipes.id = recipe_steps.recipe_id
    WHERE recipe_steps.id = step_tools.step_id
    AND recipes.user_id = auth.uid()
  )
);

-- Create saved recipes table
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_recipes_select_own" ON public.saved_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_recipes_insert_own" ON public.saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_recipes_delete_own" ON public.saved_recipes FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
