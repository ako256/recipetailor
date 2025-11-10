"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createMealPlan(name: string, description?: string) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("meal_plans")
    .insert({
      user_id: user.id,
      name,
      description: description || null,
    })
    .select()

  if (error) throw error
  return data?.[0]
}

export async function getMealPlans() {
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

  const { data, error } = await supabase.from("meal_plans").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function addMealToMealPlan(
  mealPlanId: string,
  recipeId: string,
  dayOfWeek: number,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
) {
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
    .from("meal_plan_items")
    .insert({
      meal_plan_id: mealPlanId,
      recipe_id: recipeId,
      day_of_week: dayOfWeek,
      meal_type: mealType,
    })
    .select()

  if (error) throw error
  return data?.[0]
}

export async function getMealPlanWithRecipes(mealPlanId: string) {
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
    .from("meal_plan_items")
    .select(
      `
      *,
      recipes:recipe_id (
        id,
        title,
        description,
        ingredients,
        nutrition_info:nutrition_info (
          calories_per_serving
        )
      )
    `,
    )
    .eq("meal_plan_id", mealPlanId)

  if (error) throw error
  return data || []
}

export async function deleteMealFromMealPlan(mealPlanItemId: string) {
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

  const { error } = await supabase.from("meal_plan_items").delete().eq("id", mealPlanItemId)

  if (error) throw error
}

export async function deleteMealPlan(mealPlanId: string) {
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

  const { error } = await supabase.from("meal_plans").delete().eq("id", mealPlanId)

  if (error) throw error
}
