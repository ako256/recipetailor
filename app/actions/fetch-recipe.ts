"use server"

import { createClient } from "@/lib/supabase/server"
import type { Recipe } from "@/types/recipe"

export async function fetchRecipe(recipeId: string): Promise<Recipe | null> {
  try {
    const supabase = await createClient()

    // Fetch the recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .select("id, title, description, ingredients")
      .eq("id", recipeId)
      .single()

    if (recipeError || !recipeData) {
      console.error("Failed to fetch recipe:", recipeError)
      return null
    }

    // Fetch the recipe steps
    const { data: stepsData, error: stepsError } = await supabase
      .from("recipe_steps")
      .select("id, step_number, title, description, duration_minutes")
      .eq("recipe_id", recipeId)
      .order("step_number", { ascending: true })

    if (stepsError) {
      console.error("Failed to fetch recipe steps:", stepsError)
      return null
    }

    // Fetch tools for each step
    const stepsWithTools = await Promise.all(
      (stepsData || []).map(async (step) => {
        const { data: toolsData, error: toolsError } = await supabase
          .from("step_tools")
          .select("tool_name")
          .eq("step_id", step.id)

        if (toolsError) {
          console.error("Failed to fetch tools for step:", toolsError)
          return {
            title: step.title,
            description: step.description,
            tools: [],
            duration: step.duration_minutes || 0,
          }
        }

        return {
          title: step.title,
          description: step.description,
          tools: toolsData?.map((t) => t.tool_name) || [],
          duration: step.duration_minutes || 0,
        }
      }),
    )

    return {
      title: recipeData.title,
      description: recipeData.description || "",
      ingredients: recipeData.ingredients || [],
      steps: stepsWithTools,
    }
  } catch (err) {
    console.error("Error fetching recipe:", err)
    return null
  }
}
