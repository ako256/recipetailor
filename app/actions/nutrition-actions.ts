"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { NutritionInfo } from "@/types/recipe"

export async function saveNutritionInfo(recipeId: string, nutrition: NutritionInfo) {
  if (!recipeId || recipeId.trim() === "") {
    console.warn("[v0] Skipping nutrition save: recipeId is empty")
    return
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { error } = await supabase.from("nutrition_info").upsert({
    recipe_id: recipeId,
    ...nutrition,
  })

  if (error) throw new Error("Failed to save nutrition info")
}

export async function getNutritionInfo(recipeId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { data, error } = await supabase.from("nutrition_info").select("*").eq("recipe_id", recipeId).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function rateRecipe(recipeId: string, rating: number, review?: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { error } = await supabase.from("recipe_ratings").upsert({
    recipe_id: recipeId,
    rating,
    review: review || null,
  })

  if (error) throw new Error("Failed to save rating")
}

export async function getRecipeRatings(recipeId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { data, error } = await supabase
    .from("recipe_ratings")
    .select("*")
    .eq("recipe_id", recipeId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}
