"use server"

import { createClient } from "@/lib/supabase/server"
import type { Recipe } from "@/types/recipe"

export async function saveRecipe(recipe: Recipe, publish = false) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Insert the recipe
  const { data: recipeData, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      is_published: publish,
    })
    .select()
    .single()

  if (recipeError) throw recipeError

  // Insert recipe steps and get their IDs
  const stepsData = recipe.steps.map((step, index) => ({
    recipe_id: recipeData.id,
    step_number: index + 1,
    title: step.title,
    description: step.description,
    duration_minutes: step.duration || 0,
  }))

  const { data: insertedSteps, error: stepsError } = await supabase.from("recipe_steps").insert(stepsData).select()

  if (stepsError) throw stepsError

  // Insert tools for each step using the step IDs
  const toolsData: any[] = []
  recipe.steps.forEach((step, stepIndex) => {
    if (step.tools && step.tools.length > 0) {
      const stepId = insertedSteps[stepIndex].id
      step.tools.forEach((tool) => {
        toolsData.push({
          step_id: stepId,
          tool_name: tool,
        })
      })
    }
  })

  if (toolsData.length > 0) {
    const { error: toolsError } = await supabase.from("step_tools").insert(toolsData)
    if (toolsError) throw toolsError
  }

  return recipeData
}

export async function publishRecipe(recipeId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("recipes")
    .update({ is_published: true })
    .eq("id", recipeId)
    .eq("user_id", user.id)

  if (error) throw error
}
