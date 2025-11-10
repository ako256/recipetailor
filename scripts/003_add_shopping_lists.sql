-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  recipe_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shopping_lists_select_own" ON public.shopping_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "shopping_lists_insert_own" ON public.shopping_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shopping_lists_update_own" ON public.shopping_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "shopping_lists_delete_own" ON public.shopping_lists FOR DELETE USING (auth.uid() = user_id);

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shopping_list_items_select" ON public.shopping_list_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id
    AND shopping_lists.user_id = auth.uid()
  )
);
CREATE POLICY "shopping_list_items_insert" ON public.shopping_list_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shopping_lists
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id
    AND shopping_lists.user_id = auth.uid()
  )
);
CREATE POLICY "shopping_list_items_update" ON public.shopping_list_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id
    AND shopping_lists.user_id = auth.uid()
  )
);
CREATE POLICY "shopping_list_items_delete" ON public.shopping_list_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.shopping_lists
    WHERE shopping_lists.id = shopping_list_items.shopping_list_id
    AND shopping_lists.user_id = auth.uid()
  )
);
